var main = (function () {
    'use strict';

    class AbortError extends Error {
        get name() {
            return "AbortError";
        }
    }

    class HomeServerError extends Error {
        constructor(method, url, body, status) {
            super(`${body ? body.error : status} on ${method} ${url}`);
            this.errcode = body ? body.errcode : null;
            this.retry_after_ms = body ? body.retry_after_ms : 0;
            this.statusCode = status;
        }

        get name() {
            return "HomeServerError";
        }
    }

    class ConnectionError extends Error {
        constructor(message, isTimeout) {
            super(message || "ConnectionError");
            this.isTimeout = isTimeout;
        }

        get name() {
            return "ConnectionError";
        }
    }

    class RequestResult {
        constructor(promise, controller) {
            if (!controller) {
                const abortPromise = new Promise((_, reject) => {
                    this._controller = {
                        abort() {
                            const err = new Error("fetch request aborted");
                            err.name = "AbortError";
                            reject(err);
                        }
                    };
                });
                this._promise = Promise.race([promise, abortPromise]);
            } else {
                this._promise = promise;
                this._controller = controller;
            }
        }

        abort() {
            this._controller.abort();
        }

        response() {
            return this._promise;
        }
    }

    function fetchRequest(url, options) {
        const controller = typeof AbortController === "function" ? new AbortController() : null;
        if (controller) {
            options = Object.assign(options, {
                signal: controller.signal
            });
        }
        options = Object.assign(options, {
            mode: "cors",
            credentials: "omit",
            referrer: "no-referrer",
            cache: "no-cache",
        });
        if (options.headers) {
            const headers = new Headers();
            for(const [name, value] of options.headers.entries()) {
                headers.append(name, value);
            }
            options.headers = headers;
        }
        const promise = fetch(url, options).then(async response => {
            const {status} = response;
            const body = await response.json();
            return {status, body};
        }, err => {
            if (err.name === "AbortError") {
                throw new AbortError();
            } else if (err instanceof TypeError) {
                // Network errors are reported as TypeErrors, see
                // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful
                // this can either mean user is offline, server is offline, or a CORS error (server misconfiguration).
                // 
                // One could check navigator.onLine to rule out the first
                // but the 2 latter ones are indistinguishable from javascript.
                throw new ConnectionError(`${options.method} ${url}: ${err.message}`);
            }
            throw err;
        });
        return new RequestResult(promise, controller);
    }

    function createEnum(...values) {
        const obj = {};
        for (const value of values) {
            obj[value] = value;
        }
        return Object.freeze(obj);
    }

    class BaseObservable {
        constructor() {
            this._handlers = new Set();
        }

        onSubscribeFirst() {

        }

        onUnsubscribeLast() {

        }

        subscribe(handler) {
            this._handlers.add(handler);
            if (this._handlers.size === 1) {
                this.onSubscribeFirst();
            }
            return () => {
                return this.unsubscribe(handler);
            };
        }

        unsubscribe(handler) {
            if (handler) {
                this._handlers.delete(handler);
                if (this._handlers.size === 0) {
                    this.onUnsubscribeLast();
                }
                handler = null;
            }
            return null;
        }

        // Add iterator over handlers here
    }

    // like an EventEmitter, but doesn't have an event type
    class BaseObservableValue extends BaseObservable {
        emit(argument) {
            for (const h of this._handlers) {
                h(argument);
            }
        }

    }

    class WaitForHandle {
        constructor(observable, predicate) {
            this._promise = new Promise((resolve, reject) => {
                this._reject = reject;
                this._subscription = observable.subscribe(v => {
                    if (predicate(v)) {
                        this._reject = null;
                        resolve(v);
                        this.dispose();
                    }
                });
            });
        }

        get promise() {
            return this._promise;
        }

        dispose() {
            if (this._subscription) {
                this._subscription();
                this._subscription = null;
            }
            if (this._reject) {
                this._reject(new AbortError());
                this._reject = null;
            }
        }
    }

    class ResolvedWaitForHandle {
        constructor(promise) {
            this.promise = promise;
        }

        dispose() {}
    }

    class ObservableValue extends BaseObservableValue {
        constructor(initialValue) {
            super();
            this._value = initialValue;
        }

        get() {
            return this._value;
        }

        set(value) {
            if (value !== this._value) {
                this._value = value;
                this.emit(this._value);
            }
        }

        waitFor(predicate) {
            if (predicate(this.get())) {
                return new ResolvedWaitForHandle(Promise.resolve(this.get()));
            } else {
                return new WaitForHandle(this, predicate);
            }
        }
    }

    class RequestWrapper {
        constructor(method, url, requestResult, responsePromise) {
            this._requestResult = requestResult;
            this._promise = responsePromise.then(response => {
                // ok?
                if (response.status >= 200 && response.status < 300) {
                    return response.body;
                } else {
                    switch (response.status) {
                        default:
                            throw new HomeServerError(method, url, response.body, response.status);
                    }
                }
            });
        }

        abort() {
            return this._requestResult.abort();
        }

        response() {
            return this._promise;
        }
    }

    class HomeServerApi {
        constructor({homeServer, accessToken, request, createTimeout, reconnector}) {
            // store these both in a closure somehow so it's harder to get at in case of XSS?
            // one could change the homeserver as well so the token gets sent there, so both must be protected from read/write
            this._homeserver = homeServer;
            this._accessToken = accessToken;
            this._requestFn = request;
            this._createTimeout = createTimeout;
            this._reconnector = reconnector;
        }

        _url(csPath) {
            return `${this._homeserver}/_matrix/client/r0${csPath}`;
        }

        _abortOnTimeout(timeoutAmount, requestResult, responsePromise) {
            const timeout = this._createTimeout(timeoutAmount);
            // abort request if timeout finishes first
            let timedOut = false;
            timeout.elapsed().then(
                () => {
                    timedOut = true;
                    requestResult.abort();
                },
                () => {}    // ignore AbortError
            );
            // abort timeout if request finishes first
            return responsePromise.then(
                response => {
                    timeout.abort();
                    return response;
                },
                err => {
                    timeout.abort();
                    // map error to TimeoutError
                    if (err instanceof AbortError && timedOut) {
                        throw new ConnectionError(`Request timed out after ${timeoutAmount}ms`, true);
                    } else {
                        throw err;
                    }
                }
            );
        }

        _encodeQueryParams(queryParams) {
            return Object.entries(queryParams || {})
                .filter(([, value]) => value !== undefined)
                .map(([name, value]) => {
                    if (typeof value === "object") {
                        value = JSON.stringify(value);
                    }
                    return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
                })
                .join("&");
        }

        _request(method, url, queryParams, body, options) {
            const queryString = this._encodeQueryParams(queryParams);
            url = `${url}?${queryString}`;
            let bodyString;
            const headers = new Map();
            if (this._accessToken) {
                headers.set("Authorization", `Bearer ${this._accessToken}`);
            }
            headers.set("Accept", "application/json");
            if (body) {
                headers.set("Content-Type", "application/json");
                bodyString = JSON.stringify(body);
            }
            const requestResult = this._requestFn(url, {
                method,
                headers,
                body: bodyString,
            });

            let responsePromise = requestResult.response();

            if (options && options.timeout) {
                responsePromise = this._abortOnTimeout(
                    options.timeout,
                    requestResult,
                    responsePromise
                );
            }

            const wrapper = new RequestWrapper(method, url, requestResult, responsePromise);
            
            if (this._reconnector) {
                wrapper.response().catch(err => {
                    if (err.name === "ConnectionError") {
                        this._reconnector.onRequestFailed(this);
                    }
                });
            }

            return wrapper;
        }

        _post(csPath, queryParams, body, options) {
            return this._request("POST", this._url(csPath), queryParams, body, options);
        }

        _put(csPath, queryParams, body, options) {
            return this._request("PUT", this._url(csPath), queryParams, body, options);
        }

        _get(csPath, queryParams, body, options) {
            return this._request("GET", this._url(csPath), queryParams, body, options);
        }

        sync(since, filter, timeout, options = null) {
            return this._get("/sync", {since, timeout, filter}, null, options);
        }

        // params is from, dir and optionally to, limit, filter.
        messages(roomId, params, options = null) {
            return this._get(`/rooms/${encodeURIComponent(roomId)}/messages`, params, null, options);
        }

        send(roomId, eventType, txnId, content, options = null) {
            return this._put(`/rooms/${encodeURIComponent(roomId)}/send/${encodeURIComponent(eventType)}/${encodeURIComponent(txnId)}`, {}, content, options);
        }

        passwordLogin(username, password, options = null) {
            return this._post("/login", null, {
              "type": "m.login.password",
              "identifier": {
                "type": "m.id.user",
                "user": username
              },
              "password": password
            }, options);
        }

        createFilter(userId, filter, options = null) {
            return this._post(`/user/${encodeURIComponent(userId)}/filter`, null, filter, options);
        }

        versions(options = null) {
            return this._request("GET", `${this._homeserver}/_matrix/client/versions`, null, null, options);
        }

        _parseMxcUrl(url) {
            const prefix = "mxc://";
            if (url.startsWith(prefix)) {
                return url.substr(prefix.length).split("/", 2);
            } else {
                return null;
            }
        }

        mxcUrlThumbnail(url, width, height, method) {
            const parts = this._parseMxcUrl(url);
            if (parts) {
                const [serverName, mediaId] = parts;
                const httpUrl = `${this._homeserver}/_matrix/media/r0/thumbnail/${encodeURIComponent(serverName)}/${encodeURIComponent(mediaId)}`;
                return httpUrl + "?" + this._encodeQueryParams({width, height, method});
            }
            return null;
        }

        mxcUrl(url) {
            const parts = this._parseMxcUrl(url);
            if (parts) {
                const [serverName, mediaId] = parts;
                return `${this._homeserver}/_matrix/media/r0/download/${encodeURIComponent(serverName)}/${encodeURIComponent(mediaId)}`;
            } else {
                return null;
            }
        }
    }

    class ExponentialRetryDelay {
        constructor(createTimeout) {
            const start = 2000;
            this._start = start;
            this._current = start;
            this._createTimeout = createTimeout;
            this._max = 60 * 5 * 1000; //5 min
            this._timeout = null;
        }

        async waitForRetry() {
            this._timeout = this._createTimeout(this._current);
            try {
                await this._timeout.elapsed();
                // only increase delay if we didn't get interrupted
                const next = 2 * this._current;
                this._current = Math.min(this._max, next);
            } catch(err) {
                // swallow AbortError, means abort was called
                if (!(err instanceof AbortError)) {
                    throw err;
                }
            } finally {
                this._timeout = null;
            }
        }

        abort() {
            if (this._timeout) {
                this._timeout.abort();
            }
        }

        reset() {
            this._current = this._start;
            this.abort();
        }

        get nextValue() {
            return this._current;
        }
    }

    const ConnectionStatus = createEnum(
        "Waiting",
        "Reconnecting",
        "Online"
    );

    class Reconnector {
        constructor({retryDelay, createMeasure, onlineStatus}) {
            this._onlineStatus = onlineStatus;
            this._retryDelay = retryDelay;
            this._createTimeMeasure = createMeasure;
            // assume online, and do our thing when something fails
            this._state = new ObservableValue(ConnectionStatus.Online);
            this._isReconnecting = false;
            this._versionsResponse = null;
        }

        get lastVersionsResponse() {
            return this._versionsResponse;
        }

        get connectionStatus() {
            return this._state;
        }

        get retryIn() {
            if (this._state.get() === ConnectionStatus.Waiting) {
                return this._retryDelay.nextValue - this._stateSince.measure();
            }
            return 0;
        }

        async onRequestFailed(hsApi) {
            if (!this._isReconnecting) {  
                this._isReconnecting = true;
     
                const onlineStatusSubscription = this._onlineStatus && this._onlineStatus.subscribe(online => {
                    if (online) {
                        this.tryNow();
                    }
                });

                try {
                    await this._reconnectLoop(hsApi);
                } catch (err) {
                    // nothing is catching the error above us,
                    // so just log here
                    console.error(err);
                } finally {
                    if (onlineStatusSubscription) {
                        // unsubscribe from this._onlineStatus
                        onlineStatusSubscription();
                    }
                    this._isReconnecting = false;
                }
            }
        }

        tryNow() {
            if (this._retryDelay) {
                // this will interrupt this._retryDelay.waitForRetry() in _reconnectLoop
                this._retryDelay.abort();
            }
        }

        _setState(state) {
            if (state !== this._state.get()) {
                if (state === ConnectionStatus.Waiting) {
                    this._stateSince = this._createTimeMeasure();
                } else {
                    this._stateSince = null;
                }
                this._state.set(state);
            }
        }
        
        async _reconnectLoop(hsApi) {
            this._versionsResponse = null;
            this._retryDelay.reset();

            while (!this._versionsResponse) {
                try {
                    this._setState(ConnectionStatus.Reconnecting);
                    // use 30s timeout, as a tradeoff between not giving up
                    // too quickly on a slow server, and not waiting for
                    // a stale connection when we just came online again
                    const versionsRequest = hsApi.versions({timeout: 30000});
                    this._versionsResponse = await versionsRequest.response();
                    this._setState(ConnectionStatus.Online);
                } catch (err) {
                    if (err.name === "ConnectionError") {
                        this._setState(ConnectionStatus.Waiting);
                        await this._retryDelay.waitForRetry();
                    } else {
                        throw err;
                    }
                }
            }
        }
    }

    const INCREMENTAL_TIMEOUT = 30000;

    const SyncStatus = createEnum(
        "InitialSync",
        "CatchupSync",
        "Syncing",
        "Stopped"
    );

    function parseRooms(roomsSection, roomCallback) {
        if (roomsSection) {
            const allMemberships = ["join", "invite", "leave"];
            for(const membership of allMemberships) {
                const membershipSection = roomsSection[membership];
                if (membershipSection) {
                    return Object.entries(membershipSection).map(([roomId, roomResponse]) => {
                        return roomCallback(roomId, roomResponse, membership);
                    });
                }
            }
        }
        return [];
    }

    class Sync {
        constructor({hsApi, session, storage}) {
            this._hsApi = hsApi;
            this._session = session;
            this._storage = storage;
            this._currentRequest = null;
            this._status = new ObservableValue(SyncStatus.Stopped);
            this._error = null;
        }

        get status() {
            return this._status;
        }

        /** the error that made the sync stop */
        get error() {
            return this._error;
        }

        start() {
            // not already syncing?
            if (this._status.get() !== SyncStatus.Stopped) {
                return;
            }
            let syncToken = this._session.syncToken;
            if (syncToken) {
                this._status.set(SyncStatus.CatchupSync);
            } else {
                this._status.set(SyncStatus.InitialSync);
            }
            this._syncLoop(syncToken);
        }

        async _syncLoop(syncToken) {
            // if syncToken is falsy, it will first do an initial sync ... 
            while(this._status.get() !== SyncStatus.Stopped) {
                try {
                    console.log(`starting sync request with since ${syncToken} ...`);
                    const timeout = syncToken ? INCREMENTAL_TIMEOUT : undefined; 
                    syncToken = await this._syncRequest(syncToken, timeout);
                    this._status.set(SyncStatus.Syncing);
                } catch (err) {
                    if (!(err instanceof AbortError)) {
                        this._error = err;
                        this._status.set(SyncStatus.Stopped);
                    }
                }
            }
        }

        async _syncRequest(syncToken, timeout) {
            let {syncFilterId} = this._session;
            if (typeof syncFilterId !== "string") {
                this._currentRequest = this._hsApi.createFilter(this._session.user.id, {room: {state: {lazy_load_members: true}}});
                syncFilterId = (await this._currentRequest.response()).filter_id;
            }
            const totalRequestTimeout = timeout + (80 * 1000);  // same as riot-web, don't get stuck on wedged long requests
            this._currentRequest = this._hsApi.sync(syncToken, syncFilterId, timeout, {timeout: totalRequestTimeout});
            const response = await this._currentRequest.response();
            syncToken = response.next_batch;
            const storeNames = this._storage.storeNames;
            const syncTxn = await this._storage.readWriteTxn([
                storeNames.session,
                storeNames.roomSummary,
                storeNames.roomState,
                storeNames.timelineEvents,
                storeNames.timelineFragments,
                storeNames.pendingEvents,
            ]);
            const roomChanges = [];
            let sessionChanges;
            try {
                sessionChanges = this._session.writeSync(syncToken, syncFilterId, response.account_data,  syncTxn);
                // to_device
                // presence
                if (response.rooms) {
                    const promises = parseRooms(response.rooms, async (roomId, roomResponse, membership) => {
                        let room = this._session.rooms.get(roomId);
                        if (!room) {
                            room = this._session.createRoom(roomId);
                        }
                        console.log(` * applying sync response to room ${roomId} ...`);
                        const changes = await room.writeSync(roomResponse, membership, syncTxn);
                        roomChanges.push({room, changes});
                    });
                    await Promise.all(promises);
                }
            } catch(err) {
                console.warn("aborting syncTxn because of error");
                // avoid corrupting state by only
                // storing the sync up till the point
                // the exception occurred
                syncTxn.abort();
                throw err;
            }
            try {
                await syncTxn.complete();
                console.info("syncTxn committed!!");
            } catch (err) {
                console.error("unable to commit sync tranaction");
                throw err;
            }
            this._session.afterSync(sessionChanges);
            // emit room related events after txn has been closed
            for(let {room, changes} of roomChanges) {
                room.afterSync(changes);
            }

            return syncToken;
        }

        stop() {
            if (this._status.get() === SyncStatus.Stopped) {
                return;
            }
            this._status.set(SyncStatus.Stopped);
            if (this._currentRequest) {
                this._currentRequest.abort();
                this._currentRequest = null;
            }
        }
    }

    class EventEmitter {
        constructor() {
            this._handlersByName = {};
        }

        emit(name, ...values) {
            const handlers = this._handlersByName[name];
            if (handlers) {
                for(const h of handlers) {
                    h(...values);
                }
            }
        }

        disposableOn(name, callback) {
            this.on(name, callback);
            return () => {
                this.off(name, callback);
            }
        }

        on(name, callback) {
            let handlers = this._handlersByName[name];
            if (!handlers) {
                this.onFirstSubscriptionAdded(name);
                this._handlersByName[name] = handlers = new Set();
            }
            handlers.add(callback);
        }

        off(name, callback) {
            const handlers = this._handlersByName[name];
            if (handlers) {
                handlers.delete(callback);
                if (handlers.length === 0) {
                    delete this._handlersByName[name];
                    this.onLastSubscriptionRemoved(name);
                }
            }
        }

        onFirstSubscriptionAdded(name) {}

        onLastSubscriptionRemoved(name) {}
    }

    function applySyncResponse(data, roomResponse, membership) {
        if (roomResponse.summary) {
            data = updateSummary(data, roomResponse.summary);
        }
        if (membership !== data.membership) {
            data = data.cloneIfNeeded();
            data.membership = membership;
        }
        // state comes before timeline
        if (roomResponse.state) {
            data = roomResponse.state.events.reduce(processEvent, data);
        }
        if (roomResponse.timeline) {
            data = roomResponse.timeline.events.reduce(processEvent, data);
        }

        return data;
    }

    function processEvent(data, event) {
        if (event.type === "m.room.encryption") {
            if (!data.isEncrypted) {
                data = data.cloneIfNeeded();
                data.isEncrypted = true;
            }
        }
        if (event.type === "m.room.name") {
            const newName = event.content && event.content.name;
            if (newName !== data.name) {
                data = data.cloneIfNeeded();
                data.name = newName;
            }
        } else if (event.type === "m.room.message") {
            const content = event.content;
            const body = content && content.body;
            const msgtype = content && content.msgtype;
            if (msgtype === "m.text") {
                data = data.cloneIfNeeded();
                data.lastMessageBody = body;
            }
        } else if (event.type === "m.room.canonical_alias") {
            const content = event.content;
            data = data.cloneIfNeeded();
            data.canonicalAlias = content.alias;
            data.altAliases = content.alt_aliases;
        }
        return data;
    }

    function updateSummary(data, summary) {
        const heroes = summary["m.heroes"];
        const inviteCount = summary["m.joined_member_count"];
        const joinCount = summary["m.invited_member_count"];

        if (heroes) {
            data = data.cloneIfNeeded();
            data.heroes = heroes;
        }
        if (Number.isInteger(inviteCount)) {
            data = data.cloneIfNeeded();
            data.inviteCount = inviteCount;
        }
        if (Number.isInteger(joinCount)) {
            data = data.cloneIfNeeded();
            data.joinCount = joinCount;
        }
        return data;
    }

    class SummaryData {
        constructor(copy, roomId) {
            this.roomId = copy ? copy.roomId : roomId;
            this.name = copy ? copy.name : null;
            this.lastMessageBody = copy ? copy.lastMessageBody : null;
            this.unreadCount = copy ? copy.unreadCount : null;
            this.mentionCount = copy ? copy.mentionCount : null;
            this.isEncrypted = copy ? copy.isEncrypted : null;
            this.isDirectMessage = copy ? copy.isDirectMessage : null;
            this.membership = copy ? copy.membership : null;
            this.inviteCount = copy ? copy.inviteCount : 0;
            this.joinCount = copy ? copy.joinCount : 0;
            this.heroes = copy ? copy.heroes : null;
            this.canonicalAlias = copy ? copy.canonicalAlias : null;
            this.altAliases = copy ? copy.altAliases : null;
            this.cloned = copy ? true : false;
        }

        cloneIfNeeded() {
            if (this.cloned) {
                return this;
            } else {
                return new SummaryData(this);
            }
        }

        serialize() {
            const {cloned, ...serializedProps} = this;
            return serializedProps;
        }
    }

    class RoomSummary {
    	constructor(roomId) {
            this._data = new SummaryData(null, roomId);
    	}

    	get name() {
    		if (this._data.name) {
                return this._data.name;
            }
            if (this._data.canonicalAlias) {
                return this._data.canonicalAlias;
            }
            if (Array.isArray(this._data.altAliases) && this._data.altAliases.length !== 0) {
                return this._data.altAliases[0];
            }
            if (Array.isArray(this._data.heroes) && this._data.heroes.length !== 0) {
                return this._data.heroes.join(", ");
            }
            return this._data.roomId;
    	}

    	get lastMessage() {
    		return this._data.lastMessageBody;
    	}

    	get inviteCount() {
    		return this._data.inviteCount;
    	}

    	get joinCount() {
    		return this._data.joinCount;
    	}

    	writeSync(roomResponse, membership, txn) {
            // clear cloned flag, so cloneIfNeeded makes a copy and
            // this._data is not modified if any field is changed.
            this._data.cloned = false;
    		const data = applySyncResponse(this._data, roomResponse, membership);
    		if (data !== this._data) {
                // need to think here how we want to persist
                // things like unread status (as read marker, or unread count)?
                // we could very well load additional things in the load method
                // ... the trade-off is between constantly writing the summary
                // on every sync, or doing a bit of extra reading on load
                // and have in-memory only variables for visualization
                txn.roomSummary.set(data.serialize());
                return data;
    		}
    	}

        afterSync(data) {
            this._data = data;
        }

    	async load(summary) {
            this._data = new SummaryData(summary);
    	}
    }

    const WebPlatform = {
        get minStorageKey() {
            // for indexeddb, we use unsigned 32 bit integers as keys
            return 0;
        },
        
        get middleStorageKey() {
            // for indexeddb, we use unsigned 32 bit integers as keys
            return 0x7FFFFFFF;
        },

        get maxStorageKey() {
            // for indexeddb, we use unsigned 32 bit integers as keys
            return 0xFFFFFFFF;
        },

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };

    // key for events in the timelineEvents store
    class EventKey {
        constructor(fragmentId, eventIndex) {
            this.fragmentId = fragmentId;
            this.eventIndex = eventIndex;
        }

        nextFragmentKey() {
            // could take MIN_EVENT_INDEX here if it can't be paged back
            return new EventKey(this.fragmentId + 1, WebPlatform.middleStorageKey);
        }

        nextKeyForDirection(direction) {
            if (direction.isForward) {
                return this.nextKey();
            } else {
                return this.previousKey();
            }
        }

        previousKey() {
            return new EventKey(this.fragmentId, this.eventIndex - 1);
        }

        nextKey() {
            return new EventKey(this.fragmentId, this.eventIndex + 1);
        }

        static get maxKey() {
            return new EventKey(WebPlatform.maxStorageKey, WebPlatform.maxStorageKey);
        }

        static get minKey() {
            return new EventKey(WebPlatform.minStorageKey, WebPlatform.minStorageKey);
        }

        static get defaultLiveKey() {
            return EventKey.defaultFragmentKey(WebPlatform.minStorageKey);
        }

        static defaultFragmentKey(fragmentId) {
            return new EventKey(fragmentId, WebPlatform.middleStorageKey);
        }

        toString() {
            return `[${this.fragmentId}/${this.eventIndex}]`;
        }
    }

    //entries can be sorted, first by fragment, then by entry index.
    const PENDING_FRAGMENT_ID = Number.MAX_SAFE_INTEGER;

    class BaseEntry {
        constructor(fragmentIdComparer) {
            this._fragmentIdComparer = fragmentIdComparer;
        }

        get fragmentId() {
            throw new Error("unimplemented");
        }

        get entryIndex() {
            throw new Error("unimplemented");
        }

        compare(otherEntry) {
            if (this.fragmentId === otherEntry.fragmentId) {
                return this.entryIndex - otherEntry.entryIndex;
            } else if (this.fragmentId === PENDING_FRAGMENT_ID) {
                return 1;
            } else if (otherEntry.fragmentId === PENDING_FRAGMENT_ID) {
                return -1;
            } else {
                // This might throw if the relation of two fragments is unknown.
                return this._fragmentIdComparer.compare(this.fragmentId, otherEntry.fragmentId);
            }
        }

        asEventKey() {
            return new EventKey(this.fragmentId, this.entryIndex);
        }
    }

    class EventEntry extends BaseEntry {
        constructor(eventEntry, fragmentIdComparer) {
            super(fragmentIdComparer);
            this._eventEntry = eventEntry;
        }

        get fragmentId() {
            return this._eventEntry.fragmentId;
        }

        get entryIndex() {
            return this._eventEntry.eventIndex;
        }

        get content() {
            return this._eventEntry.event.content;
        }

        get prevContent() {
            const unsigned = this._eventEntry.event.unsigned;
            return unsigned && unsigned.prev_content;
        }

        get eventType() {
            return this._eventEntry.event.type;
        }

        get stateKey() {
            return this._eventEntry.event.state_key;
        }

        get sender() {
            return this._eventEntry.event.sender;
        }

        get timestamp() {
            return this._eventEntry.event.origin_server_ts;
        }

        get id() {
            return this._eventEntry.event.event_id;
        }
    }

    class Direction {
        constructor(isForward) {
            this._isForward = isForward;
        }

        get isForward() {
            return this._isForward;
        }

        get isBackward() {
            return !this.isForward;
        }

        asApiString() {
            return this.isForward ? "f" : "b";
        }

        reverse() {
            return this.isForward ? Direction.Backward : Direction.Forward
        }

        static get Forward() {
            return _forward;
        }

        static get Backward() {
            return _backward;
        }
    }

    const _forward = Object.freeze(new Direction(true));
    const _backward = Object.freeze(new Direction(false));

    function isValidFragmentId(id) {
        return typeof id === "number";
    }

    class FragmentBoundaryEntry extends BaseEntry {
        constructor(fragment, isFragmentStart, fragmentIdComparer) {
            super(fragmentIdComparer);
            this._fragment = fragment;
            // TODO: should isFragmentStart be Direction instead of bool?
            this._isFragmentStart = isFragmentStart;
        }

        static start(fragment, fragmentIdComparer) {
            return new FragmentBoundaryEntry(fragment, true, fragmentIdComparer);
        }

        static end(fragment, fragmentIdComparer) {
            return new FragmentBoundaryEntry(fragment, false, fragmentIdComparer);
        }
        
        get started() {
            return this._isFragmentStart;
        }

        get hasEnded() {
            return !this.started;
        }

        get fragment() {
            return this._fragment;
        }

        get fragmentId() {
            return this._fragment.id;
        }

        get entryIndex() {
            if (this.started) {
                return WebPlatform.minStorageKey;
            } else {
                return WebPlatform.maxStorageKey;
            }
        }

        get isGap() {
            return !!this.token;
        }

        get token() {
            if (this.started) {
                return this.fragment.previousToken;
            } else {
                return this.fragment.nextToken;
            }
        }

        set token(token) {
            if (this.started) {
                this.fragment.previousToken = token;
            } else {
                this.fragment.nextToken = token;
            }
        }

        get linkedFragmentId() {
            if (this.started) {
                return this.fragment.previousId;
            } else {
                return this.fragment.nextId;
            }
        }

        set linkedFragmentId(id) {
            if (this.started) {
                this.fragment.previousId = id;
            } else {
                this.fragment.nextId = id;
            }
        }

        get hasLinkedFragment() {
            return isValidFragmentId(this.linkedFragmentId);
        }

        get direction() {
            if (this.started) {
                return Direction.Backward;
            } else {
                return Direction.Forward;
            }
        }

        withUpdatedFragment(fragment) {
            return new FragmentBoundaryEntry(fragment, this._isFragmentStart, this._fragmentIdComparer);
        }

        createNeighbourEntry(neighbour) {
            return new FragmentBoundaryEntry(neighbour, !this._isFragmentStart, this._fragmentIdComparer);
        }
    }

    function createEventEntry(key, roomId, event) {
        return {
            fragmentId: key.fragmentId,
            eventIndex: key.eventIndex,
            roomId,
            event: event,
        };
    }

    function directionalAppend(array, value, direction) {
        if (direction.isForward) {
            array.push(value);
        } else {
            array.unshift(value);
        }
    }

    function directionalConcat(array, otherArray, direction) {
        if (direction.isForward) {
            return array.concat(otherArray);
        } else {
            return otherArray.concat(array);
        }
    }

    // Synapse bug? where the m.room.create event appears twice in sync response
    // when first syncing the room
    function deduplicateEvents(events) {
        const eventIds = new Set();
        return events.filter(e => {
            if (eventIds.has(e.event_id)) {
                return false;
            } else {
                eventIds.add(e.event_id);
                return true;
            }
        });
    }

    class SyncWriter {
        constructor({roomId, fragmentIdComparer}) {
            this._roomId = roomId;
            this._fragmentIdComparer = fragmentIdComparer;
            this._lastLiveKey = null;
        }

        async load(txn) {
            const liveFragment = await txn.timelineFragments.liveFragment(this._roomId);
            if (liveFragment) {
                const [lastEvent] = await txn.timelineEvents.lastEvents(this._roomId, liveFragment.id, 1);
                // sorting and identifying (e.g. sort key and pk to insert) are a bit intertwined here
                // we could split it up into a SortKey (only with compare) and
                // a EventKey (no compare or fragment index) with nextkey methods and getters/setters for eventIndex/fragmentId
                // we probably need to convert from one to the other though, so bother?
                this._lastLiveKey = new EventKey(liveFragment.id, lastEvent.eventIndex);
            }
            // if there is no live fragment, we don't create it here because load gets a readonly txn.
            // this is on purpose, load shouldn't modify the store
            console.log("room persister load", this._roomId, this._lastLiveKey && this._lastLiveKey.toString());
        }

        async _createLiveFragment(txn, previousToken) {
            const liveFragment = await txn.timelineFragments.liveFragment(this._roomId);
            if (!liveFragment) {
                if (!previousToken) {
                    previousToken = null;
                }
                const fragment = {
                    roomId: this._roomId,
                    id: EventKey.defaultLiveKey.fragmentId,
                    previousId: null,
                    nextId: null,
                    previousToken: previousToken,
                    nextToken: null
                };
                txn.timelineFragments.add(fragment);
                this._fragmentIdComparer.add(fragment);
                return fragment;
            } else {
                return liveFragment;
            }
        }

        async _replaceLiveFragment(oldFragmentId, newFragmentId, previousToken, txn) {
            const oldFragment = await txn.timelineFragments.get(this._roomId, oldFragmentId);
            if (!oldFragment) {
                throw new Error(`old live fragment doesn't exist: ${oldFragmentId}`);
            }
            oldFragment.nextId = newFragmentId;
            txn.timelineFragments.update(oldFragment);
            const newFragment = {
                roomId: this._roomId,
                id: newFragmentId,
                previousId: oldFragmentId,
                nextId: null,
                previousToken: previousToken,
                nextToken: null
            };
            txn.timelineFragments.add(newFragment);
            this._fragmentIdComparer.append(newFragmentId, oldFragmentId);
            return {oldFragment, newFragment};
        }

        async writeSync(roomResponse, txn) {
            const entries = [];
            const timeline = roomResponse.timeline;
            let currentKey = this._lastLiveKey;
            if (!currentKey) {
                // means we haven't synced this room yet (just joined or did initial sync)
                
                // as this is probably a limited sync, prev_batch should be there
                // (but don't fail if it isn't, we won't be able to back-paginate though)
                let liveFragment = await this._createLiveFragment(txn, timeline.prev_batch);
                currentKey = new EventKey(liveFragment.id, EventKey.defaultLiveKey.eventIndex);
                entries.push(FragmentBoundaryEntry.start(liveFragment, this._fragmentIdComparer));
            } else if (timeline.limited) {
                // replace live fragment for limited sync, *only* if we had a live fragment already
                const oldFragmentId = currentKey.fragmentId;
                currentKey = currentKey.nextFragmentKey();
                const {oldFragment, newFragment} = await this._replaceLiveFragment(oldFragmentId, currentKey.fragmentId, timeline.prev_batch, txn);
                entries.push(FragmentBoundaryEntry.end(oldFragment, this._fragmentIdComparer));
                entries.push(FragmentBoundaryEntry.start(newFragment, this._fragmentIdComparer));
            }
            if (timeline.events) {
                const events = deduplicateEvents(timeline.events);
                for(const event of events) {
                    currentKey = currentKey.nextKey();
                    const entry = createEventEntry(currentKey, this._roomId, event);
                    txn.timelineEvents.insert(entry);
                    entries.push(new EventEntry(entry, this._fragmentIdComparer));
                }
            }
            // persist state
            const state = roomResponse.state;
            if (state.events) {
                for (const event of state.events) {
                    txn.roomState.setStateEvent(this._roomId, event);
                }
            }
            // persist live state events in timeline
            if (timeline.events) {
                for (const event of timeline.events) {
                    if (typeof event.state_key === "string") {
                        txn.roomState.setStateEvent(this._roomId, event);
                    }
                }
            }

            return {entries, newLiveKey: currentKey};
        }

        afterSync(newLiveKey) {
            this._lastLiveKey = newLiveKey;
        }
    }

    class GapWriter {
        constructor({roomId, storage, fragmentIdComparer}) {
            this._roomId = roomId;
            this._storage = storage;
            this._fragmentIdComparer = fragmentIdComparer;
        }
        // events is in reverse-chronological order (last event comes at index 0) if backwards
        async _findOverlappingEvents(fragmentEntry, events, txn) {
            let expectedOverlappingEventId;
            if (fragmentEntry.hasLinkedFragment) {
                expectedOverlappingEventId = await this._findExpectedOverlappingEventId(fragmentEntry, txn);
            }
            let remainingEvents = events;
            let nonOverlappingEvents = [];
            let neighbourFragmentEntry;
            while (remainingEvents && remainingEvents.length) {
                const eventIds = remainingEvents.map(e => e.event_id);
                const duplicateEventId = await txn.timelineEvents.findFirstOccurringEventId(this._roomId, eventIds);
                if (duplicateEventId) {
                    const duplicateEventIndex = remainingEvents.findIndex(e => e.event_id === duplicateEventId);
                    // should never happen, just being defensive as this *can't* go wrong
                    if (duplicateEventIndex === -1) {
                        throw new Error(`findFirstOccurringEventId returned ${duplicateEventIndex} which wasn't ` +
                            `in [${eventIds.join(",")}] in ${this._roomId}`);
                    }
                    nonOverlappingEvents.push(...remainingEvents.slice(0, duplicateEventIndex));
                    if (!expectedOverlappingEventId || duplicateEventId === expectedOverlappingEventId) {
                        // TODO: check here that the neighbourEvent is at the correct edge of it's fragment
                        // get neighbour fragment to link it up later on
                        const neighbourEvent = await txn.timelineEvents.getByEventId(this._roomId, duplicateEventId);
                        const neighbourFragment = await txn.timelineFragments.get(this._roomId, neighbourEvent.fragmentId);
                        neighbourFragmentEntry = fragmentEntry.createNeighbourEntry(neighbourFragment);
                        // trim overlapping events
                        remainingEvents = null;
                    } else {
                        // we've hit https://github.com/matrix-org/synapse/issues/7164, 
                        // e.g. the event id we found is already in our store but it is not
                        // the adjacent fragment id. Ignore the event, but keep processing the ones after.
                        remainingEvents = remainingEvents.slice(duplicateEventIndex + 1);
                    }
                } else {
                    nonOverlappingEvents.push(...remainingEvents);
                    remainingEvents = null;
                }
            }
            return {nonOverlappingEvents, neighbourFragmentEntry};
        }

        async _findExpectedOverlappingEventId(fragmentEntry, txn) {
            const eventEntry = await this._findFragmentEdgeEvent(
                fragmentEntry.linkedFragmentId,
                // reverse because it's the oppose edge of the linked fragment
                fragmentEntry.direction.reverse(),
                txn);
            if (eventEntry) {
                return eventEntry.event.event_id;
            }
        }

        async _findFragmentEdgeEventKey(fragmentEntry, txn) {
            const {fragmentId, direction} = fragmentEntry;
            const event = await this._findFragmentEdgeEvent(fragmentId, direction, txn);
            if (event) {
                return new EventKey(event.fragmentId, event.eventIndex);
            } else {
                // no events yet in the fragment ... odd, but let's not fail and take the default key
                return EventKey.defaultFragmentKey(fragmentEntry.fragmentId);
            }
        }

        async _findFragmentEdgeEvent(fragmentId, direction, txn) {
            if (direction.isBackward) {
                const [firstEvent] = await txn.timelineEvents.firstEvents(this._roomId, fragmentId, 1);
                return firstEvent;
            } else {
                const [lastEvent] = await txn.timelineEvents.lastEvents(this._roomId, fragmentId, 1);
                return lastEvent;
            }
        }

        _storeEvents(events, startKey, direction, txn) {
            const entries = [];
            // events is in reverse chronological order for backwards pagination,
            // e.g. order is moving away from the `from` point.
            let key = startKey;
            for(let event of events) {
                key = key.nextKeyForDirection(direction);
                const eventStorageEntry = createEventEntry(key, this._roomId, event);
                txn.timelineEvents.insert(eventStorageEntry);
                const eventEntry = new EventEntry(eventStorageEntry, this._fragmentIdComparer);
                directionalAppend(entries, eventEntry, direction);
            }
            return entries;
        }

        async _updateFragments(fragmentEntry, neighbourFragmentEntry, end, entries, txn) {
            const {direction} = fragmentEntry;
            const changedFragments = [];
            directionalAppend(entries, fragmentEntry, direction);
            // set `end` as token, and if we found an event in the step before, link up the fragments in the fragment entry
            if (neighbourFragmentEntry) {
                // the throws here should never happen and are only here to detect client or unhandled server bugs
                // and a last measure to prevent corrupting fragment links
                if (!fragmentEntry.hasLinkedFragment) {
                    fragmentEntry.linkedFragmentId = neighbourFragmentEntry.fragmentId;
                } else if (fragmentEntry.linkedFragmentId !== neighbourFragmentEntry.fragmentId) {
                    throw new Error(`Prevented changing fragment ${fragmentEntry.fragmentId} ` +
                        `${fragmentEntry.direction.asApiString()} link from ${fragmentEntry.linkedFragmentId} ` +
                        `to ${neighbourFragmentEntry.fragmentId} in ${this._roomId}`);
                }
                if (!neighbourFragmentEntry.hasLinkedFragment) {
                    neighbourFragmentEntry.linkedFragmentId = fragmentEntry.fragmentId;
                } else if (neighbourFragmentEntry.linkedFragmentId !== fragmentEntry.fragmentId) {
                    throw new Error(`Prevented changing fragment ${neighbourFragmentEntry.fragmentId} ` +
                        `${neighbourFragmentEntry.direction.asApiString()} link from ${neighbourFragmentEntry.linkedFragmentId} ` +
                        `to ${fragmentEntry.fragmentId} in ${this._roomId}`);
                }
                // if neighbourFragmentEntry was found, it means the events were overlapping,
                // so no pagination should happen anymore.
                neighbourFragmentEntry.token = null;
                fragmentEntry.token = null;

                txn.timelineFragments.update(neighbourFragmentEntry.fragment);
                directionalAppend(entries, neighbourFragmentEntry, direction);

                // fragments that need to be changed in the fragmentIdComparer here
                // after txn succeeds
                changedFragments.push(fragmentEntry.fragment);
                changedFragments.push(neighbourFragmentEntry.fragment);
            } else {
                fragmentEntry.token = end;
            }
            txn.timelineFragments.update(fragmentEntry.fragment);

            return changedFragments;
        }

        async writeFragmentFill(fragmentEntry, response, txn) {
            const {fragmentId, direction} = fragmentEntry;
            // chunk is in reverse-chronological order when backwards
            const {chunk, start, end} = response;
            let entries;

            if (!Array.isArray(chunk)) {
                throw new Error("Invalid chunk in response");
            }
            if (typeof end !== "string") {
                throw new Error("Invalid end token in response");
            }

            // make sure we have the latest fragment from the store
            const fragment = await txn.timelineFragments.get(this._roomId, fragmentId);
            if (!fragment) {
                throw new Error(`Unknown fragment: ${fragmentId}`);
            }
            fragmentEntry = fragmentEntry.withUpdatedFragment(fragment);
            // check that the request was done with the token we are aware of (extra care to avoid timeline corruption)
            if (fragmentEntry.token !== start) {
                throw new Error("start is not equal to prev_batch or next_batch");
            }
            // find last event in fragment so we get the eventIndex to begin creating keys at
            let lastKey = await this._findFragmentEdgeEventKey(fragmentEntry, txn);
            // find out if any event in chunk is already present using findFirstOrLastOccurringEventId
            const {
                nonOverlappingEvents,
                neighbourFragmentEntry
            } = await this._findOverlappingEvents(fragmentEntry, chunk, txn);

            // create entries for all events in chunk, add them to entries
            entries = this._storeEvents(nonOverlappingEvents, lastKey, direction, txn);
            const fragments = await this._updateFragments(fragmentEntry, neighbourFragmentEntry, end, entries, txn);
        
            return {entries, fragments};
        }
    }

    class BaseObservableList extends BaseObservable {
        emitReset() {
            for(let h of this._handlers) {
                h.onReset(this);
            }
        }
        // we need batch events, mostly on index based collection though?
        // maybe we should get started without?
        emitAdd(index, value) {
            for(let h of this._handlers) {
                h.onAdd(index, value, this);
            }
        }

        emitUpdate(index, value, params) {
            for(let h of this._handlers) {
                h.onUpdate(index, value, params, this);
            }
        }

        emitRemove(index, value) {
            for(let h of this._handlers) {
                h.onRemove(index, value, this);
            }
        }

        // toIdx assumes the item has already
        // been removed from its fromIdx
        emitMove(fromIdx, toIdx, value) {
            for(let h of this._handlers) {
                h.onMove(fromIdx, toIdx, value, this);
            }
        }

        [Symbol.iterator]() {
            throw new Error("unimplemented");
        }

        get length() {
            throw new Error("unimplemented");
        }
    }

    /**
     * @license
     * Based off baseSortedIndex function in Lodash <https://lodash.com/>
     * Copyright JS Foundation and other contributors <https://js.foundation/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */
    function sortedIndex(array, value, comparator) {
        let low = 0;
        let high = array.length;

        while (low < high) {
            let mid = (low + high) >>> 1;
            let cmpResult = comparator(value, array[mid]);

            if (cmpResult > 0) {
                low = mid + 1;
            } else if (cmpResult < 0) {
                high = mid;
            } else {
                low = high = mid;
            }
        }
        return high;
    }

    class BaseObservableMap extends BaseObservable {
        emitReset() {
            for(let h of this._handlers) {
                h.onReset();
            }
        }
        // we need batch events, mostly on index based collection though?
        // maybe we should get started without?
        emitAdd(key, value) {
            for(let h of this._handlers) {
                h.onAdd(key, value);
            }
        }

        emitUpdate(key, value, ...params) {
            for(let h of this._handlers) {
                h.onUpdate(key, value, ...params);
            }
        }

        emitRemove(key, value) {
            for(let h of this._handlers) {
                h.onRemove(key, value);
            }
        }
    }

    class ObservableMap extends BaseObservableMap {
        constructor(initialValues) {
            super();
            this._values = new Map(initialValues);
        }

        update(key, params) {
            const value = this._values.get(key);
            if (value !== undefined) {
                // could be the same value, so it's already updated
                // but we don't assume this here
                this._values.set(key, value);
                this.emitUpdate(key, value, params);
                return true;
            }
            return false;   // or return existing value?
        }

        add(key, value) {
            if (!this._values.has(key)) {
                this._values.set(key, value);
                this.emitAdd(key, value);
                return true;
            }
            return false;   // or return existing value?
        }

        remove(key) {
            const value = this._values.get(key);
            if (value !== undefined) {
                this._values.delete(key);
                this.emitRemove(key, value);
                return true;
            } else {
                return false;
            }
        }

        reset() {
            this._values.clear();
            this.emitReset();
        }

        get(key) {
            return this._values.get(key);
        }

        get size() {
            return this._values.size;
        }

        [Symbol.iterator]() {
            return this._values.entries();
        }
    }

    /*

    when a value changes, it sorting order can change. It would still be at the old index prior to firing an onUpdate event.
    So how do you know where it was before it changed, if not by going over all values?

    how to make this fast?

    seems hard to solve with an array, because you need to map the key to it's previous location somehow, to efficiently find it,
    and move it.

    I wonder if we could do better with a binary search tree (BST).
    The tree has a value with {key, value}. There is a plain Map mapping keys to this tuple,
    for easy lookup. Now how do we find the index of this tuple in the BST?

    either we store in every node the amount of nodes on the left and right, or we decend into the part
    of the tree preceding the node we want to know about. Updating the counts upwards would probably be fine as this is log2 of
    the size of the container.

    to be able to go from a key to an index, the value would have the have a link with the tree node though

    so key -> Map<key,value> -> value -> node -> *parentNode -> rootNode
    with a node containing {value, leftCount, rightCount, leftNode, rightNode, parentNode}
    */

    // does not assume whether or not the values are reference
    // types modified outside of the collection (and affecting sort order) or not

    // no duplicates allowed for now
    class SortedMapList extends BaseObservableList {
        constructor(sourceMap, comparator) {
            super();
            this._sourceMap = sourceMap;
            this._comparator = (a, b) => comparator(a.value, b.value);
            this._sortedPairs = null;
            this._mapSubscription = null;
        }
        
        onAdd(key, value) {
            const pair = {key, value};
            const idx = sortedIndex(this._sortedPairs, pair, this._comparator);
            this._sortedPairs.splice(idx, 0, pair);
            this.emitAdd(idx, value);
        }

        onRemove(key, value) {
            const pair = {key, value};
            const idx = sortedIndex(this._sortedPairs, pair, this._comparator);
            // assert key === this._sortedPairs[idx].key;
            this._sortedPairs.splice(idx, 1);
            this.emitRemove(idx, value);
        }

        onUpdate(key, value, params) {
            // TODO: suboptimal for performance, see above for idea with BST to speed this up if we need to
            const oldIdx = this._sortedPairs.findIndex(p => p.key === key);
            // neccesary to remove pair from array before
            // doing sortedIndex as it relies on being sorted
            this._sortedPairs.splice(oldIdx, 1);
            const pair = {key, value};
            const newIdx = sortedIndex(this._sortedPairs, pair, this._comparator);
            this._sortedPairs.splice(newIdx, 0, pair);
            if (oldIdx !== newIdx) {
                this.emitMove(oldIdx, newIdx, value);
            }
            this.emitUpdate(newIdx, value, params);
        }

        onReset() {
            this._sortedPairs = [];
            this.emitReset();
        }

        onSubscribeFirst() {
            this._mapSubscription = this._sourceMap.subscribe(this);
            this._sortedPairs = new Array(this._sourceMap.size);
            let i = 0;
            for (let [key, value] of this._sourceMap) {
                this._sortedPairs[i] = {key, value};
                ++i;
            }
            this._sortedPairs.sort(this._comparator);
            super.onSubscribeFirst();
        }

        onUnsubscribeLast() {
            super.onUnsubscribeLast();
            this._sortedPairs = null;
            this._mapSubscription = this._mapSubscription();
        }

        get(index) {
            return this._sortedPairs[index].value;
        }

        get length() {
            return this._sourceMap.size;
        }

        [Symbol.iterator]() {
            const it = this._sortedPairs.values();
            return {
                next() {
                    const v = it.next();
                    if (v.value) {
                        v.value = v.value.value;
                    }
                    return v;
                }
            }
        }
    }

    class FilteredMap extends BaseObservableMap {
        constructor(source, mapper, updater) {
            super();
            this._source = source;
            this._mapper = mapper;
            this._updater = updater;
            this._mappedValues = new Map();
        }

        onAdd(key, value) {
            const mappedValue = this._mapper(value);
            this._mappedValues.set(key, mappedValue);
            this.emitAdd(key, mappedValue);
        }

        onRemove(key, _value) {
            const mappedValue = this._mappedValues.get(key);
            if (this._mappedValues.delete(key)) {
                this.emitRemove(key, mappedValue);
            }
        }

        onChange(key, value, params) {
            const mappedValue = this._mappedValues.get(key);
            if (mappedValue !== undefined) {
                const newParams = this._updater(value, params);
                if (newParams !== undefined) {
                    this.emitChange(key, mappedValue, newParams);
                }
            }
        }

        onSubscribeFirst() {
            for (let [key, value] of this._source) {
                const mappedValue = this._mapper(value);
                this._mappedValues.set(key, mappedValue);
            }
            super.onSubscribeFirst();
        }

        onUnsubscribeLast() {
            super.onUnsubscribeLast();
            this._mappedValues.clear();
        }

        onReset() {
            this._mappedValues.clear();
            this.emitReset();
        }

        [Symbol.iterator]() {
            return this._mappedValues.entries()[Symbol.iterator];
        }
    }

    /*
    so a mapped value can emit updates on it's own with this._updater that is passed in the mapping function
    how should the mapped value be notified of an update though? and can it then decide to not propagate the update?
    */
    class MappedMap extends BaseObservableMap {
        constructor(source, mapper) {
            super();
            this._source = source;
            this._mapper = mapper;
            this._mappedValues = new Map();
            this._updater = (key, params) => {  // this should really be (value, params) but can't make that work for now
                const value = this._mappedValues.get(key);
                this.onUpdate(key, value, params);
            };
        }

        onAdd(key, value) {
            const mappedValue = this._mapper(value, this._updater);
            this._mappedValues.set(key, mappedValue);
            this.emitAdd(key, mappedValue);
        }

        onRemove(key, _value) {
            const mappedValue = this._mappedValues.get(key);
            if (this._mappedValues.delete(key)) {
                this.emitRemove(key, mappedValue);
            }
        }

        onUpdate(key, value, params) {
            const mappedValue = this._mappedValues.get(key);
            if (mappedValue !== undefined) {
                const newParams = this._updater(value, params);
                // if (newParams !== undefined) {
                    this.emitUpdate(key, mappedValue, newParams);
                // }
            }
        }

        onSubscribeFirst() {
            this._subscription = this._source.subscribe(this);
            for (let [key, value] of this._source) {
                const mappedValue = this._mapper(value, this._updater);
                this._mappedValues.set(key, mappedValue);
            }
            super.onSubscribeFirst();
        }

        onUnsubscribeLast() {
            this._subscription = this._subscription();
            this._mappedValues.clear();
        }

        onReset() {
            this._mappedValues.clear();
            this.emitReset();
        }

        [Symbol.iterator]() {
            return this._mappedValues.entries();
        }
    }

    class SortedArray extends BaseObservableList {
        constructor(comparator) {
            super();
            this._comparator = comparator;
            this._items = [];
        }

        setManyUnsorted(items) {
            this.setManySorted(items);
        }

        setManySorted(items) {
            // TODO: we can make this way faster by only looking up the first and last key,
            // and merging whatever is inbetween with items
            // if items is not sorted, 💩🌀 will follow!
            // should we check?
            // Also, once bulk events are supported in collections,
            // we can do a bulk add event here probably if there are no updates
            // BAD CODE!
            for(let item of items) {
                this.set(item);
            }
        }

        set(item, updateParams = null) {
            const idx = sortedIndex(this._items, item, this._comparator);
            if (idx >= this._items.length || this._comparator(this._items[idx], item) !== 0) {
                this._items.splice(idx, 0, item);
                this.emitAdd(idx, item);
            } else {
                this._items[idx] = item;
                this.emitUpdate(idx, item, updateParams);
            }
        }

        get(idx) {
            return this._items[idx];
        }

        remove(idx) {
            const item = this._items[idx];
            this._items.splice(idx, 1);
            this.emitRemove(idx, item);
        }

        get array() {
            return this._items;
        }

        get length() {
            return this._items.length;
        }

        [Symbol.iterator]() {
            return this._items.values();
        }
    }

    class MappedList extends BaseObservableList {
        constructor(sourceList, mapper, updater) {
            super();
            this._sourceList = sourceList;
            this._mapper = mapper;
            this._updater = updater;
            this._sourceUnsubscribe = null;
            this._mappedValues = null;
        }

        onSubscribeFirst() {
            this._sourceUnsubscribe = this._sourceList.subscribe(this);
            this._mappedValues = [];
            for (const item of this._sourceList) {
                this._mappedValues.push(this._mapper(item));
            }
        }

        onReset() {
            this._mappedValues = [];
            this.emitReset();
        }

        onAdd(index, value) {
            const mappedValue = this._mapper(value);
            this._mappedValues.splice(index, 0, mappedValue);
            this.emitAdd(index, mappedValue);
        }

        onUpdate(index, value, params) {
            const mappedValue = this._mappedValues[index];
            if (this._updater) {
                this._updater(mappedValue, params, value);
            }
            this.emitUpdate(index, mappedValue, params);
        }

        onRemove(index) {
            const mappedValue = this._mappedValues[index];
            this._mappedValues.splice(index, 1);
            this.emitRemove(index, mappedValue);
        }

        onMove(fromIdx, toIdx) {
            const mappedValue = this._mappedValues[fromIdx];
            this._mappedValues.splice(fromIdx, 1);
            this._mappedValues.splice(toIdx, 0, mappedValue);
            this.emitMove(fromIdx, toIdx, mappedValue);
        }

        onUnsubscribeLast() {
            this._sourceUnsubscribe();
        }

        get length() {
            return this._mappedValues.length;
        }

        [Symbol.iterator]() {
            return this._mappedValues.values();
        }
    }

    class ConcatList extends BaseObservableList {
        constructor(...sourceLists) {
            super();
            this._sourceLists = sourceLists;
            this._sourceUnsubscribes = null;
        }

        _offsetForSource(sourceList) {
            const listIdx = this._sourceLists.indexOf(sourceList);
            let offset = 0;
            for (let i = 0; i < listIdx; ++i) {
                offset += this._sourceLists[i].length;
            }
            return offset;
        }

        onSubscribeFirst() {
            this._sourceUnsubscribes = [];
            for (const sourceList of this._sourceLists) {
                this._sourceUnsubscribes.push(sourceList.subscribe(this));
            }
        }

        onUnsubscribeLast() {
            for (const sourceUnsubscribe of this._sourceUnsubscribes) {
                sourceUnsubscribe();
            }
        }

        onReset() {
            // TODO: not ideal if other source lists are large
            // but working impl for now
            // reset, and 
            this.emitReset();
            let idx = 0;
            for(const item of this) {
                this.emitAdd(idx, item);
                idx += 1;
            }
        }

        onAdd(index, value, sourceList) {
            this.emitAdd(this._offsetForSource(sourceList) + index, value);
        }

        onUpdate(index, value, params, sourceList) {
            this.emitUpdate(this._offsetForSource(sourceList) + index, value, params);
        }

        onRemove(index, value, sourceList) {
            this.emitRemove(this._offsetForSource(sourceList) + index, value);
        }

        onMove(fromIdx, toIdx, value, sourceList) {
            const offset = this._offsetForSource(sourceList);
            this.emitMove(offset + fromIdx, offset + toIdx, value);
        }

        get length() {
            let len = 0;
            for (let i = 0; i < this._sourceLists.length; ++i) {
                len += this._sourceLists[i].length;
            }
            return len;
        }

        [Symbol.iterator]() {
            let sourceListIdx = 0;
            let it = this._sourceLists[0][Symbol.iterator]();
            return {
                next: () => {
                    let result = it.next();
                    while (result.done) {
                        sourceListIdx += 1;
                        if (sourceListIdx >= this._sourceLists.length) {
                            return result;  //done
                        }
                        it = this._sourceLists[sourceListIdx][Symbol.iterator]();
                        result = it.next();
                    }
                    return result;
                }
            }
        }
    }

    // avoid circular dependency between these classes
    // and BaseObservableMap (as they extend it)
    Object.assign(BaseObservableMap.prototype, {
        sortValues(comparator) {
            return new SortedMapList(this, comparator);
        },

        mapValues(mapper) {
            return new MappedMap(this, mapper);
        },

        filterValues(filter) {
            return new FilteredMap(this, filter);
        }
    });

    class TimelineReader {
        constructor({roomId, storage, fragmentIdComparer}) {
            this._roomId = roomId;
            this._storage = storage;
            this._fragmentIdComparer = fragmentIdComparer;
        }

        _openTxn() {
            return this._storage.readTxn([
                this._storage.storeNames.timelineEvents,
                this._storage.storeNames.timelineFragments,
            ]);
        }

        async readFrom(eventKey, direction, amount) {
            const txn = await this._openTxn();
            return this._readFrom(eventKey, direction, amount, txn);
        }

        async _readFrom(eventKey, direction, amount, txn) {
            let entries = [];
            const timelineStore = txn.timelineEvents;
            const fragmentStore = txn.timelineFragments;
            
            while (entries.length < amount && eventKey) {
                let eventsWithinFragment;
                if (direction.isForward) {
                    eventsWithinFragment = await timelineStore.eventsAfter(this._roomId, eventKey, amount);
                } else {
                    eventsWithinFragment = await timelineStore.eventsBefore(this._roomId, eventKey, amount);
                }
                const eventEntries = eventsWithinFragment.map(e => new EventEntry(e, this._fragmentIdComparer));
                entries = directionalConcat(entries, eventEntries, direction);
                // prepend or append eventsWithinFragment to entries, and wrap them in EventEntry

                if (entries.length < amount) {
                    const fragment = await fragmentStore.get(this._roomId, eventKey.fragmentId);
                    // this._fragmentIdComparer.addFragment(fragment);
                    let fragmentEntry = new FragmentBoundaryEntry(fragment, direction.isBackward, this._fragmentIdComparer);
                    // append or prepend fragmentEntry, reuse func from GapWriter?
                    directionalAppend(entries, fragmentEntry, direction);
                    // don't count it in amount perhaps? or do?
                    if (fragmentEntry.hasLinkedFragment) {
                        const nextFragment = await fragmentStore.get(this._roomId, fragmentEntry.linkedFragmentId);
                        this._fragmentIdComparer.add(nextFragment);
                        const nextFragmentEntry = new FragmentBoundaryEntry(nextFragment, direction.isForward, this._fragmentIdComparer);
                        directionalAppend(entries, nextFragmentEntry, direction);
                        eventKey = nextFragmentEntry.asEventKey();
                    } else {
                        eventKey = null;
                    }
                }
            }

            return entries;
        }

        async readFromEnd(amount) {
            const txn = await this._openTxn();
            const liveFragment = await txn.timelineFragments.liveFragment(this._roomId);
            // room hasn't been synced yet
            if (!liveFragment) {
                return [];
            }
            this._fragmentIdComparer.add(liveFragment);
            const liveFragmentEntry = FragmentBoundaryEntry.end(liveFragment, this._fragmentIdComparer);
            const eventKey = liveFragmentEntry.asEventKey();
            const entries = await this._readFrom(eventKey, Direction.Backward, amount, txn);
            entries.unshift(liveFragmentEntry);
            return entries;
        }

        // reads distance up and down from eventId
        // or just expose eventIdToKey?
        readAtEventId(eventId, distance) {
            return null;
        }
    }

    class PendingEventEntry extends BaseEntry {
        constructor({pendingEvent, user}) {
            super(null);
            this._pendingEvent = pendingEvent;
            this._user = user;
        }

        get fragmentId() {
            return PENDING_FRAGMENT_ID;
        }

        get entryIndex() {
            return this._pendingEvent.queueIndex;
        }

        get content() {
            return this._pendingEvent.content;
        }

        get event() {
            return null;
        }

        get eventType() {
            return this._pendingEvent.eventType;
        }

        get stateKey() {
            return null;
        }

        get sender() {
            return this._user.id;
        }

        get timestamp() {
            return null;
        }

        get isPending() {
            return true;
        }

        get id() {
            return this._pendingEvent.txnId;
        }

        notifyUpdate() {
            
        }
    }

    class Timeline {
        constructor({roomId, storage, closeCallback, fragmentIdComparer, pendingEvents, user}) {
            this._roomId = roomId;
            this._storage = storage;
            this._closeCallback = closeCallback;
            this._fragmentIdComparer = fragmentIdComparer;
            this._remoteEntries = new SortedArray((a, b) => a.compare(b));
            this._timelineReader = new TimelineReader({
                roomId: this._roomId,
                storage: this._storage,
                fragmentIdComparer: this._fragmentIdComparer
            });
            const localEntries = new MappedList(pendingEvents, pe => {
                return new PendingEventEntry({pendingEvent: pe, user});
            }, (pee, params) => {
                pee.notifyUpdate(params);
            });
            this._allEntries = new ConcatList(this._remoteEntries, localEntries);
        }

        /** @package */
        async load() {
            const entries = await this._timelineReader.readFromEnd(50);
            this._remoteEntries.setManySorted(entries);
        }

        // TODO: should we rather have generic methods for
        // - adding new entries
        // - updating existing entries (redaction, relations)
        /** @package */
        appendLiveEntries(newEntries) {
            this._remoteEntries.setManySorted(newEntries);
        }

        /** @package */
        addGapEntries(newEntries) {
            this._remoteEntries.setManySorted(newEntries);
        }
        
        // tries to prepend `amount` entries to the `entries` list.
        async loadAtTop(amount) {
            const firstEventEntry = this._remoteEntries.array.find(e => !!e.eventType);
            if (!firstEventEntry) {
                return;
            }
            const entries = await this._timelineReader.readFrom(
                firstEventEntry.asEventKey(),
                Direction.Backward,
                amount
            );
            this._remoteEntries.setManySorted(entries);
        }

        /** @public */
        get entries() {
            return this._allEntries;
        }

        /** @public */
        close() {
            if (this._closeCallback) {
                this._closeCallback();
                this._closeCallback = null;
            }
        }
    }

    /*
    lookups will be far more frequent than changing fragment order,
    so data structure should be optimized for fast lookup

    we can have a Map: fragmentId to sortIndex

    changing the order, we would need to rebuild the index
    lets do this the stupid way for now, changing any fragment rebuilds all islands

    to build this:
    first load all fragments
    put them in a map by id
    now iterate through them

    until no more fragments
        get the first
        create an island array, and add to list with islands
        going backwards and forwards
            get and remove sibling and prepend/append it to island array
            stop when no more previous/next
        return list with islands

    */

    function findBackwardSiblingFragments(current, byId) {
        const sortedSiblings = [];
        while (isValidFragmentId(current.previousId)) {
            const previous = byId.get(current.previousId);
            if (!previous) {
                break;
            }
            if (previous.nextId !== current.id) {
                throw new Error(`Previous fragment ${previous.id} doesn't point back to ${current.id}`);
            }
            byId.delete(current.previousId);
            sortedSiblings.unshift(previous);
            current = previous;
        }
        return sortedSiblings;
    }

    function findForwardSiblingFragments(current, byId) {
        const sortedSiblings = [];
        while (isValidFragmentId(current.nextId)) {
            const next = byId.get(current.nextId);
            if (!next) {
                break;
            }
            if (next.previousId !== current.id) {
                throw new Error(`Next fragment ${next.id} doesn't point back to ${current.id}`);
            }
            byId.delete(current.nextId);
            sortedSiblings.push(next);
            current = next;
        }
        return sortedSiblings;
    }


    function createIslands(fragments) {
        const byId = new Map();
        for(let f of fragments) {
            byId.set(f.id, f);
        }

        const islands = [];
        while(byId.size) {
            const current = byId.values().next().value;
            byId.delete(current.id);
            // new island
            const previousSiblings = findBackwardSiblingFragments(current, byId);
            const nextSiblings = findForwardSiblingFragments(current, byId);
            const island = previousSiblings.concat(current, nextSiblings);
            islands.push(island);
        }
        return islands.map(a => new Island(a));
    }

    class Fragment {
        constructor(id, previousId, nextId) {
            this.id = id;
            this.previousId = previousId;
            this.nextId = nextId;
        }
    }

    class Island {
        constructor(sortedFragments) {
            this._idToSortIndex = new Map();
            sortedFragments.forEach((f, i) => {
                this._idToSortIndex.set(f.id, i);
            });
        }

        compare(idA, idB) {
            const sortIndexA = this._idToSortIndex.get(idA);
            if (sortIndexA === undefined) {
                throw new Error(`first id ${idA} isn't part of this island`);
            }
            const sortIndexB = this._idToSortIndex.get(idB);
            if (sortIndexB === undefined) {
                throw new Error(`second id ${idB} isn't part of this island`);
            }
            return sortIndexA - sortIndexB;
        }

        get fragmentIds() {
            return this._idToSortIndex.keys();
        }
    }

    /*
    index for fast lookup of how two fragments can be sorted
    */
    class FragmentIdComparer {
        constructor(fragments) {
            this._fragmentsById = fragments.reduce((map, f) => {map.set(f.id, f); return map;}, new Map());
            this.rebuild(fragments);
        }

        _getIsland(id) {
            const island = this._idToIsland.get(id);
            if (island === undefined) {
                throw new Error(`Unknown fragment id ${id}`);
            }
            return island;
        }

        compare(idA, idB) {
            if (idA === idB) {
                return 0;
            }
            const islandA = this._getIsland(idA);
            const islandB = this._getIsland(idB);
            if (islandA !== islandB) {
                throw new Error(`${idA} and ${idB} are on different islands, can't tell order`);
            }
            return islandA.compare(idA, idB);
        }

        rebuild(fragments) {
            const islands = createIslands(fragments);
            this._idToIsland = new Map();
            for(let island of islands) {
                for(let id of island.fragmentIds) {
                    this._idToIsland.set(id, island);
                }
            }
        }

        /** use for fragments coming out of persistence, not newly created ones, or also fragments for a new island (like for a permalink) */
        add(fragment) {
            const copy = new Fragment(fragment.id, fragment.previousId, fragment.nextId);
            this._fragmentsById.set(fragment.id, copy);
            this.rebuild(this._fragmentsById.values());
        }

        /** use for appending newly created fragments */
        append(id, previousId) {
            const fragment = new Fragment(id, previousId, null);
            const prevFragment = this._fragmentsById.get(previousId);
            if (prevFragment) {
                prevFragment.nextId = id;
            }
            this._fragmentsById.set(id, fragment);
            this.rebuild(this._fragmentsById.values());
        }

        /** use for prepending newly created fragments */
        prepend(id, nextId) {
            const fragment = new Fragment(id, null, nextId);
            const nextFragment = this._fragmentsById.get(nextId);
            if (nextFragment) {
                nextFragment.previousId = id;
            }
            this._fragmentsById.set(id, fragment);
            this.rebuild(this._fragmentsById.values());
        }
    }

    class PendingEvent {
        constructor(data) {
            this._data = data;
        }

        get roomId() { return this._data.roomId; }
        get queueIndex() { return this._data.queueIndex; }
        get eventType() { return this._data.eventType; }
        get txnId() { return this._data.txnId; }
        get remoteId() { return this._data.remoteId; }
        set remoteId(value) { this._data.remoteId = value; }
        get content() { return this._data.content; }
        get data() { return this._data; }
    }

    function makeTxnId() {
        const n = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const str = n.toString(16);
        return "t" + "0".repeat(14 - str.length) + str;
    }

    class SendQueue {
        constructor({roomId, storage, sendScheduler, pendingEvents}) {
            pendingEvents = pendingEvents || [];
            this._roomId = roomId;
            this._storage = storage;
            this._sendScheduler = sendScheduler;
            this._pendingEvents = new SortedArray((a, b) => a.queueIndex - b.queueIndex);
            if (pendingEvents.length) {
                console.info(`SendQueue for room ${roomId} has ${pendingEvents.length} pending events`, pendingEvents);
            }
            this._pendingEvents.setManyUnsorted(pendingEvents.map(data => new PendingEvent(data)));
            this._isSending = false;
            this._offline = false;
            this._amountSent = 0;
        }

        async _sendLoop() {
            this._isSending = true;
            try {
                console.log("start sending", this._amountSent, "<", this._pendingEvents.length);
                while (this._amountSent < this._pendingEvents.length) {
                    const pendingEvent = this._pendingEvents.get(this._amountSent);
                    console.log("trying to send", pendingEvent.content.body);
                    if (pendingEvent.remoteId) {
                        continue;
                    }
                    console.log("really sending now");
                    const response = await this._sendScheduler.request(hsApi => {
                        console.log("got sendScheduler slot");
                        return hsApi.send(
                            pendingEvent.roomId,
                            pendingEvent.eventType,
                            pendingEvent.txnId,
                            pendingEvent.content
                        ).response();
                    });
                    pendingEvent.remoteId = response.event_id;
                    // 
                    console.log("writing remoteId now");
                    await this._tryUpdateEvent(pendingEvent);
                    console.log("keep sending?", this._amountSent, "<", this._pendingEvents.length);
                    this._amountSent += 1;
                }
            } catch(err) {
                if (err instanceof ConnectionError) {
                    this._offline = true;
                }
            } finally {
                this._isSending = false;
            }
        }

        removeRemoteEchos(events, txn) {
            const removed = [];
            for (const event of events) {
                const txnId = event.unsigned && event.unsigned.transaction_id;
                let idx;
                if (txnId) {
                    idx = this._pendingEvents.array.findIndex(pe => pe.txnId === txnId);
                } else {
                    idx = this._pendingEvents.array.findIndex(pe => pe.remoteId === event.event_id);
                }
                if (idx !== -1) {
                    const pendingEvent = this._pendingEvents.get(idx);
                    txn.pendingEvents.remove(pendingEvent.roomId, pendingEvent.queueIndex);
                    removed.push(pendingEvent);
                }
            }
            return removed;
        }

        emitRemovals(pendingEvents) {
            for (const pendingEvent of pendingEvents) {
                const idx = this._pendingEvents.array.indexOf(pendingEvent);
                if (idx !== -1) {
                    this._amountSent -= 1;
                    this._pendingEvents.remove(idx);
                }
            }
        }

        resumeSending() {
            this._offline = false;
            if (!this._isSending) {
                this._sendLoop();
            }
        }

        async enqueueEvent(eventType, content) {
            const pendingEvent = await this._createAndStoreEvent(eventType, content);
            this._pendingEvents.set(pendingEvent);
            console.log("added to _pendingEvents set", this._pendingEvents.length);
            if (!this._isSending && !this._offline) {
                this._sendLoop();
            }
        }

        get pendingEvents() {
            return this._pendingEvents;
        }

        async _tryUpdateEvent(pendingEvent) {
            const txn = await this._storage.readWriteTxn([this._storage.storeNames.pendingEvents]);
            console.log("_tryUpdateEvent: got txn");
            try {
                // pendingEvent might have been removed already here
                // by a racing remote echo, so check first so we don't recreate it
                console.log("_tryUpdateEvent: before exists");
                if (await txn.pendingEvents.exists(pendingEvent.roomId, pendingEvent.queueIndex)) {
                    console.log("_tryUpdateEvent: inside if exists");
                    txn.pendingEvents.update(pendingEvent.data);
                }
                console.log("_tryUpdateEvent: after exists");
            } catch (err) {
                txn.abort();
                console.log("_tryUpdateEvent: error", err);
                throw err;
            }
            console.log("_tryUpdateEvent: try complete");
            await txn.complete();
        }

        async _createAndStoreEvent(eventType, content) {
            console.log("_createAndStoreEvent");
            const txn = await this._storage.readWriteTxn([this._storage.storeNames.pendingEvents]);
            let pendingEvent;
            try {
                const pendingEventsStore = txn.pendingEvents;
                console.log("_createAndStoreEvent getting maxQueueIndex");
                const maxQueueIndex = await pendingEventsStore.getMaxQueueIndex(this._roomId) || 0;
                console.log("_createAndStoreEvent got maxQueueIndex", maxQueueIndex);
                const queueIndex = maxQueueIndex + 1;
                pendingEvent = new PendingEvent({
                    roomId: this._roomId,
                    queueIndex,
                    eventType,
                    content,
                    txnId: makeTxnId()
                });
                console.log("_createAndStoreEvent: adding to pendingEventsStore");
                pendingEventsStore.add(pendingEvent.data);
            } catch (err) {
                txn.abort();
                throw err;
            }
            await txn.complete();
            return pendingEvent;
        }
    }

    class Room extends EventEmitter {
    	constructor({roomId, storage, hsApi, emitCollectionChange, sendScheduler, pendingEvents, user}) {
            super();
            this._roomId = roomId;
            this._storage = storage;
            this._hsApi = hsApi;
    		this._summary = new RoomSummary(roomId);
            this._fragmentIdComparer = new FragmentIdComparer([]);
    		this._syncWriter = new SyncWriter({roomId, fragmentIdComparer: this._fragmentIdComparer});
            this._emitCollectionChange = emitCollectionChange;
            this._sendQueue = new SendQueue({roomId, storage, sendScheduler, pendingEvents});
            this._timeline = null;
            this._user = user;
    	}

        async writeSync(roomResponse, membership, txn) {
    		const summaryChanges = this._summary.writeSync(roomResponse, membership, txn);
    		const {entries, newLiveKey} = await this._syncWriter.writeSync(roomResponse, txn);
            let removedPendingEvents;
            if (roomResponse.timeline && roomResponse.timeline.events) {
                removedPendingEvents = this._sendQueue.removeRemoteEchos(roomResponse.timeline.events, txn);
            }
            return {summaryChanges, newTimelineEntries: entries, newLiveKey, removedPendingEvents};
        }

        afterSync({summaryChanges, newTimelineEntries, newLiveKey, removedPendingEvents}) {
            this._syncWriter.afterSync(newLiveKey);
            if (summaryChanges) {
                this._summary.afterSync(summaryChanges);
                this.emit("change");
                this._emitCollectionChange(this);
            }
            if (this._timeline) {
                this._timeline.appendLiveEntries(newTimelineEntries);
            }
            if (removedPendingEvents) {
                this._sendQueue.emitRemovals(removedPendingEvents);
            }
    	}

        resumeSending() {
            this._sendQueue.resumeSending();
        }

    	load(summary, txn) {
    		this._summary.load(summary);
    		return this._syncWriter.load(txn);
    	}

        sendEvent(eventType, content) {
            return this._sendQueue.enqueueEvent(eventType, content);
        }


        /** @public */
        async fillGap(fragmentEntry, amount) {
            const response = await this._hsApi.messages(this._roomId, {
                from: fragmentEntry.token,
                dir: fragmentEntry.direction.asApiString(),
                limit: amount,
                filter: {lazy_load_members: true}
            }).response();

            const txn = await this._storage.readWriteTxn([
                this._storage.storeNames.pendingEvents,
                this._storage.storeNames.timelineEvents,
                this._storage.storeNames.timelineFragments,
            ]);
            let removedPendingEvents;
            let gapResult;
            try {
                // detect remote echos of pending messages in the gap
                removedPendingEvents = this._sendQueue.removeRemoteEchos(response.chunk, txn);
                // write new events into gap
                const gapWriter = new GapWriter({
                    roomId: this._roomId,
                    storage: this._storage,
                    fragmentIdComparer: this._fragmentIdComparer
                });
                gapResult = await gapWriter.writeFragmentFill(fragmentEntry, response, txn);
            } catch (err) {
                txn.abort();
                throw err;
            }
            await txn.complete();
            // once txn is committed, update in-memory state & emit events
            for (const fragment of gapResult.fragments) {
                this._fragmentIdComparer.add(fragment);
            }
            if (removedPendingEvents) {
                this._sendQueue.emitRemovals(removedPendingEvents);
            }
            if (this._timeline) {
                this._timeline.addGapEntries(gapResult.entries);
            }
        }

        get name() {
            return this._summary.name;
        }

        get id() {
            return this._roomId;
        }

        async openTimeline() {
            if (this._timeline) {
                throw new Error("not dealing with load race here for now");
            }
            console.log(`opening the timeline for ${this._roomId}`);
            this._timeline = new Timeline({
                roomId: this.id,
                storage: this._storage,
                fragmentIdComparer: this._fragmentIdComparer,
                pendingEvents: this._sendQueue.pendingEvents,
                closeCallback: () => {
                    console.log(`closing the timeline for ${this._roomId}`);
                    this._timeline = null;
                },
                user: this._user,
            });
            await this._timeline.load();
            return this._timeline;
        }

        mxcUrlThumbnail(url, width, height, method) {
            return this._hsApi.mxcUrlThumbnail(url, width, height, method);
        }

        mxcUrl(url) {
            return this._hsApi.mxcUrl(url);
        }
    }

    class RateLimitingBackoff {
        constructor() {
            this._remainingRateLimitedRequest = 0;
        }

        async waitAfterLimitExceeded(retryAfterMs) {
            // this._remainingRateLimitedRequest = 5;
            // if (typeof retryAfterMs !== "number") {
            // } else {
            // }
            if (!retryAfterMs) {
                retryAfterMs = 5000;
            }
            await WebPlatform.delay(retryAfterMs);
        }

        // do we have to know about succeeding requests?
        // we can just 

        async waitForNextSend() {
            // this._remainingRateLimitedRequest = Math.max(0, this._remainingRateLimitedRequest - 1);
        }
    }

    /*
    this represents a slot to do one rate limited api call.
    because rate-limiting is handled here, it should only
    try to do one call, so the SendScheduler can safely
    retry if the call ends up being rate limited.
    This is also why we have this abstraction it hsApi is not
    passed straight to SendQueue when it is its turn to send.
    e.g. we wouldn't want to repeat the callback in SendQueue that could
    have other side-effects before the call to hsApi that we wouldn't want
    repeated (setting up progress handlers for file uploads,
    ... a UI update to say it started sending?
     ... updating storage would probably only happen once the call succeeded
     ... doing multiple hsApi calls for e.g. a file upload before sending a image message (they should individually be retried)
    ) maybe it is a bit overengineering, but lets stick with it for now.
    At least the above is a clear definition why we have this class
    */
    //class SendSlot -- obsolete

    class SendScheduler {
        constructor({hsApi, backoff}) {
            this._hsApi = hsApi;
            this._sendRequests = [];
            this._sendScheduled = false;
            this._stopped = false;
            this._waitTime = 0;
            this._backoff = backoff;
            /* 
            we should have some sort of flag here that we enable
            after all the rooms have been notified that they can resume
            sending, so that from session, we can say scheduler.enable();
            this way, when we have better scheduling, it won't be first come,
            first serve, when there are a lot of events in different rooms to send,
            but we can apply some priorization of who should go first
            */
            // this._enabled;
        }

        stop() {
            // TODO: abort current requests and set offline
        }

        start() {
            this._stopped = false;
        }

        get isStarted() {
            return !this._stopped;
        }

        // this should really be per roomId to avoid head-of-line blocking
        // 
        // takes a callback instead of returning a promise with the slot
        // to make sure the scheduler doesn't get blocked by a slot that is not consumed
        request(sendCallback) {
            let request;
            const promise = new Promise((resolve, reject) => request = {resolve, reject, sendCallback});
            this._sendRequests.push(request);
            if (!this._sendScheduled && !this._stopped) {
                this._sendLoop();
            }
            return promise;
        }

        async _sendLoop() {
            while (this._sendRequests.length) {
                const request = this._sendRequests.shift();
                let result;
                try {
                    // this can throw!
                    result = await this._doSend(request.sendCallback);
                } catch (err) {
                    if (err instanceof ConnectionError) {
                        // we're offline, everybody will have
                        // to re-request slots when we come back online
                        this._stopped = true;
                        for (const r of this._sendRequests) {
                            r.reject(err);
                        }
                        this._sendRequests = [];
                    }
                    console.error("error for request", request);
                    request.reject(err);
                    break;
                }
                request.resolve(result);
            }
            // do next here instead of in _doSend
        }

        async _doSend(sendCallback) {
            this._sendScheduled = false;
            await this._backoff.waitForNextSend();
            // loop is left by return or throw
            while (true) { // eslint-disable-line no-constant-condition
                try {
                    return await sendCallback(this._hsApi);
                } catch (err) {
                    if (err instanceof HomeServerError && err.errcode === "M_LIMIT_EXCEEDED") {
                        await this._backoff.waitAfterLimitExceeded(err.retry_after_ms);
                    } else {
                        throw err;
                    }
                }
            }
        }
    }

    class User {
        constructor(userId) {
            this._userId = userId;
        }

        get id() {
            return this._userId;
        }
    }

    class Session {
        // sessionInfo contains deviceId, userId and homeServer
        constructor({storage, hsApi, sessionInfo}) {
            this._storage = storage;
            this._hsApi = hsApi;
            this._session = null;
            this._sessionInfo = sessionInfo;
            this._rooms = new ObservableMap();
            this._sendScheduler = new SendScheduler({hsApi, backoff: new RateLimitingBackoff()});
            this._roomUpdateCallback = (room, params) => this._rooms.update(room.id, params);
            this._user = new User(sessionInfo.userId);
        }

        async load() {
            const txn = await this._storage.readTxn([
                this._storage.storeNames.session,
                this._storage.storeNames.roomSummary,
                this._storage.storeNames.roomState,
                this._storage.storeNames.timelineEvents,
                this._storage.storeNames.timelineFragments,
                this._storage.storeNames.pendingEvents,
            ]);
            // restore session object
            this._session = await txn.session.get();
            if (!this._session) {
                this._session = {};
                return;
            }
            const pendingEventsByRoomId = await this._getPendingEventsByRoom(txn);
            // load rooms
            const rooms = await txn.roomSummary.getAll();
            await Promise.all(rooms.map(summary => {
                const room = this.createRoom(summary.roomId, pendingEventsByRoomId.get(summary.roomId));
                return room.load(summary, txn);
            }));
        }

        get isStarted() {
            return this._sendScheduler.isStarted;
        }

        stop() {
            this._sendScheduler.stop();
        }

        async start(lastVersionResponse) {
            if (lastVersionResponse) {
                // store /versions response
                const txn = await this._storage.readWriteTxn([
                    this._storage.storeNames.session
                ]);
                const newSessionData = Object.assign({}, this._session, {serverVersions: lastVersionResponse});
                txn.session.set(newSessionData);
                // TODO: what can we do if this throws?
                await txn.complete();
                this._session = newSessionData;
            }

            this._sendScheduler.start();
            for (const [, room] of this._rooms) {
                room.resumeSending();
            }
        }

        async _getPendingEventsByRoom(txn) {
            const pendingEvents = await txn.pendingEvents.getAll();
            return pendingEvents.reduce((groups, pe) => {
                const group = groups.get(pe.roomId);
                if (group) {
                    group.push(pe);
                } else {
                    groups.set(pe.roomId, [pe]);
                }
                return groups;
            }, new Map());
        }

        get rooms() {
            return this._rooms;
        }

        createRoom(roomId, pendingEvents) {
            const room = new Room({
                roomId,
                storage: this._storage,
                emitCollectionChange: this._roomUpdateCallback,
                hsApi: this._hsApi,
                sendScheduler: this._sendScheduler,
                pendingEvents,
                user: this._user,
            });
            this._rooms.add(roomId, room);
            return room;
        }

        writeSync(syncToken, syncFilterId, accountData, txn) {
            if (syncToken !== this._session.syncToken) {
                // don't modify this._session because transaction might still fail
                const newSessionData = Object.assign({}, this._session, {syncToken, syncFilterId});
                txn.session.set(newSessionData);
                return newSessionData;
            }
        }

        afterSync(newSessionData) {
            if (newSessionData) {
                // sync transaction succeeded, modify object state now
                this._session = newSessionData;
            }
        }

        get syncToken() {
            return this._session.syncToken;
        }

        get syncFilterId() {
            return this._session.syncFilterId;
        }

        get user() {
            return this._user;
        }
    }

    const LoadStatus = createEnum(
        "NotLoading",
        "Login",
        "LoginFailed",
        "Loading",
        "Migrating",    //not used atm, but would fit here
        "FirstSync",
        "Error",
        "Ready",
    );

    const LoginFailure = createEnum(
        "Connection",
        "Credentials",
        "Unknown",
    );

    class SessionContainer {
        constructor({clock, random, onlineStatus, request, storageFactory, sessionInfoStorage}) {
            this._random = random;
            this._clock = clock;
            this._onlineStatus = onlineStatus;
            this._request = request;
            this._storageFactory = storageFactory;
            this._sessionInfoStorage = sessionInfoStorage;

            this._status = new ObservableValue(LoadStatus.NotLoading);
            this._error = null;
            this._loginFailure = null;
            this._reconnector = null;
            this._session = null;
            this._sync = null;
            this._sessionId = null;
            this._storage = null;
        }

        createNewSessionId() {
            return (Math.floor(this._random() * Number.MAX_SAFE_INTEGER)).toString();
        }

        async startWithExistingSession(sessionId) {
            if (this._status.get() !== LoadStatus.NotLoading) {
                return;
            }
            this._status.set(LoadStatus.Loading);
            try {
                const sessionInfo = await this._sessionInfoStorage.get(sessionId);
                if (!sessionInfo) {
                    throw new Error("Invalid session id: " + sessionId);
                }
                await this._loadSessionInfo(sessionInfo);
            } catch (err) {
                this._error = err;
                this._status.set(LoadStatus.Error);
            }
        }

        async startWithLogin(homeServer, username, password) {
            if (this._status.get() !== LoadStatus.NotLoading) {
                return;
            }
            this._status.set(LoadStatus.Login);
            let sessionInfo;
            try {
                const hsApi = new HomeServerApi({homeServer, request: this._request, createTimeout: this._clock.createTimeout});
                const loginData = await hsApi.passwordLogin(username, password).response();
                const sessionId = this.createNewSessionId();
                sessionInfo = {
                    id: sessionId,
                    deviceId: loginData.device_id,
                    userId: loginData.user_id,
                    homeServer: homeServer,
                    accessToken: loginData.access_token,
                    lastUsed: this._clock.now()
                };
                await this._sessionInfoStorage.add(sessionInfo);            
            } catch (err) {
                this._error = err;
                if (err instanceof HomeServerError) {
                    if (err.errcode === "M_FORBIDDEN") {
                        this._loginFailure = LoginFailure.Credentials;
                    } else {
                        this._loginFailure = LoginFailure.Unknown;
                    }
                    this._status.set(LoadStatus.LoginFailed);
                } else if (err instanceof ConnectionError) {
                    this._loginFailure = LoginFailure.Connection;
                    this._status.set(LoadStatus.LoginFailure);
                } else {
                    this._status.set(LoadStatus.Error);
                }
                return;
            }
            // loading the session can only lead to
            // LoadStatus.Error in case of an error,
            // so separate try/catch
            try {
                await this._loadSessionInfo(sessionInfo);
            } catch (err) {
                this._error = err;
                this._status.set(LoadStatus.Error);
            }
        }

        async _loadSessionInfo(sessionInfo) {
            this._status.set(LoadStatus.Loading);
            this._reconnector = new Reconnector({
                onlineStatus: this._onlineStatus,
                retryDelay: new ExponentialRetryDelay(this._clock.createTimeout),
                createMeasure: this._clock.createMeasure
            });
            const hsApi = new HomeServerApi({
                homeServer: sessionInfo.homeServer,
                accessToken: sessionInfo.accessToken,
                request: this._request,
                reconnector: this._reconnector,
                createTimeout: this._clock.createTimeout
            });
            this._sessionId = sessionInfo.id;
            this._storage = await this._storageFactory.create(sessionInfo.id);
            // no need to pass access token to session
            const filteredSessionInfo = {
                deviceId: sessionInfo.deviceId,
                userId: sessionInfo.userId,
                homeServer: sessionInfo.homeServer,
            };
            this._session = new Session({storage: this._storage, sessionInfo: filteredSessionInfo, hsApi});
            await this._session.load();
            
            this._sync = new Sync({hsApi, storage: this._storage, session: this._session});
            // notify sync and session when back online
            this._reconnectSubscription = this._reconnector.connectionStatus.subscribe(state => {
                if (state === ConnectionStatus.Online) {
                    this._sync.start();
                    this._session.start(this._reconnector.lastVersionsResponse);
                }
            });
            await this._waitForFirstSync();

            this._status.set(LoadStatus.Ready);

            // if the sync failed, and then the reconnector
            // restored the connection, it would have already
            // started to session, so check first
            // to prevent an extra /versions request
            if (this._session.isStarted) {
                const lastVersionsResponse = await hsApi.versions({timeout: 10000}).response();
                this._session.start(lastVersionsResponse);
            }
        }

        async _waitForFirstSync() {
            try {
                this._sync.start();
                this._status.set(LoadStatus.FirstSync);
            } catch (err) {
                // swallow ConnectionError here and continue,
                // as the reconnector above will call 
                // sync.start again to retry in this case
                if (!(err instanceof ConnectionError)) {
                    throw err;
                }
            }
            // only transition into Ready once the first sync has succeeded
            this._waitForFirstSyncHandle = this._sync.status.waitFor(s => s === SyncStatus.Syncing);
            try {
                await this._waitForFirstSyncHandle.promise;
            } catch (err) {
                // if dispose is called from stop, bail out
                if (err instanceof AbortError) {
                    return;
                }
                throw err;
            } finally {
                this._waitForFirstSyncHandle = null;
            }
        }


        get loadStatus() {
            return this._status;
        }

        get loadError() {
            return this._error;
        }

        /** only set at loadStatus InitialSync, CatchupSync or Ready */
        get sync() {
            return this._sync;
        }

        /** only set at loadStatus InitialSync, CatchupSync or Ready */
        get session() {
            return this._session;
        }

        get reconnector() {
            return this._reconnector;
        }

        stop() {
            this._reconnectSubscription();
            this._reconnectSubscription = null;
            this._sync.stop();
            this._session.stop();
            if (this._waitForFirstSyncHandle) {
                this._waitForFirstSyncHandle.dispose();
                this._waitForFirstSyncHandle = null;
            }
            if (this._storage) {
                this._storage.close();
                this._storage = null;
            }
        }

        async deleteSession() {
            if (this._sessionId) {
                // if one fails, don't block the other from trying
                // also, run in parallel
                await Promise.all([
                    this._storageFactory.delete(this._sessionId),
                    this._sessionInfoStorage.delete(this._sessionId),
                ]);
                this._sessionId = null;
            }
        }
    }

    const STORE_NAMES = Object.freeze([
        "session",
        "roomState",
        "roomSummary",
        "timelineEvents",
        "timelineFragments",
        "pendingEvents",
    ]);

    const STORE_MAP = Object.freeze(STORE_NAMES.reduce((nameMap, name) => {
        nameMap[name] = name;
        return nameMap;
    }, {}));

    class StorageError extends Error {
        constructor(message, cause, value) {
            let fullMessage = message;
            if (cause) {
                fullMessage += ": ";
                if (typeof cause.name === "string") {
                    fullMessage += `(name: ${cause.name}) `;
                }
                if (typeof cause.code === "number") {
                    fullMessage += `(code: ${cause.name}) `;
                }
                fullMessage += cause.message;
            }
            super(fullMessage);
            if (cause) {
                this.errcode = cause.name;
            }
            this.cause = cause;
            this.value = value;
        }
    }

    // storage keys are defined to be unsigned 32bit numbers in WebPlatform.js, which is assumed by idb
    function encodeUint32(n) {
        const hex = n.toString(16);
        return "0".repeat(8 - hex.length) + hex;
    }

    function decodeUint32(str) {
        return parseInt(str, 16);
    }

    function openDatabase(name, createObjectStore, version) {
        const req = window.indexedDB.open(name, version);
        req.onupgradeneeded = (ev) => {
            const db = ev.target.result;
            const oldVersion = ev.oldVersion;
            createObjectStore(db, oldVersion, version);
        }; 
        return reqAsPromise(req);
    }

    function wrapError(err) {
        return new StorageError(`wrapped DOMException`, err);
    }

    function reqAsPromise(req) {
        return new Promise((resolve, reject) => {
            req.addEventListener("success", event => resolve(event.target.result));
            req.addEventListener("error", event => reject(wrapError(event.target.error)));
        });
    }

    function txnAsPromise(txn) {
        return new Promise((resolve, reject) => {
            txn.addEventListener("complete", resolve);
            txn.addEventListener("abort", event => reject(wrapError(event.target.error)));
        });
    }

    function iterateCursor(cursorRequest, processValue) {
        // TODO: does cursor already have a value here??
        return new Promise((resolve, reject) => {
            cursorRequest.onerror = () => {
                reject(new StorageError("Query failed", cursorRequest.error));
            };
            // collect results
            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (!cursor) {
                    resolve(false);
                    return; // end of results
                }
                const {done, jumpTo} = processValue(cursor.value, cursor.key);
                if (done) {
                    resolve(true);
                } else if(jumpTo) {
                    cursor.continue(jumpTo);
                } else {
                    cursor.continue();
                }
            };
        }).catch(err => {
            throw new StorageError("iterateCursor failed", err);
        });
    }

    class QueryTarget {
        constructor(target) {
            this._target = target;
        }

        _openCursor(range, direction) {
            if (range && direction) {
                return this._target.openCursor(range, direction);
            } else if (range) {
                return this._target.openCursor(range);
            } else if (direction) {
                return this._target.openCursor(null, direction);
            } else {
                return this._target.openCursor();
            }
        }

        supports(methodName) {
            return this._target.supports(methodName);
        }

        get(key) {
            return reqAsPromise(this._target.get(key));
        }

        getKey(key) {
            return reqAsPromise(this._target.getKey(key));
        }

        reduce(range, reducer, initialValue) {
            return this._reduce(range, reducer, initialValue, "next");
        }

        reduceReverse(range, reducer, initialValue) {
            return this._reduce(range, reducer, initialValue, "prev");
        }
        
        selectLimit(range, amount) {
            return this._selectLimit(range, amount, "next");
        }

        selectLimitReverse(range, amount) {
            return this._selectLimit(range, amount, "prev");
        }

        selectWhile(range, predicate) {
            return this._selectWhile(range, predicate, "next");
        }

        selectWhileReverse(range, predicate) {
            return this._selectWhile(range, predicate, "prev");
        }

        async selectAll(range, direction) {
            const cursor = this._openCursor(range, direction);
            const results = [];
            await iterateCursor(cursor, (value) => {
                results.push(value);
                return {done: false};
            });
            return results;
        }

        selectFirst(range) {
            return this._find(range, () => true, "next");
        }

        selectLast(range) {
            return this._find(range, () => true, "prev");
        }

        find(range, predicate) {
            return this._find(range, predicate, "next");
        }

        findReverse(range, predicate) {
            return this._find(range, predicate, "prev");
        }

        async findMaxKey(range) {
            const cursor = this._target.openKeyCursor(range, "prev");
            let maxKey;
            await iterateCursor(cursor, (_, key) => {
                maxKey = key;
                return {done: true};
            });
            return maxKey;
        }

        /**
         * Checks if a given set of keys exist.
         * Calls `callback(key, found)` for each key in `keys`, in key sorting order (or reversed if backwards=true).
         * If the callback returns true, the search is halted and callback won't be called again.
         * `callback` is called with the same instances of the key as given in `keys`, so direct comparison can be used.
         */
        async findExistingKeys(keys, backwards, callback) {
            const direction = backwards ? "prev" : "next";
            const compareKeys = (a, b) => backwards ? -indexedDB.cmp(a, b) : indexedDB.cmp(a, b);
            const sortedKeys = keys.slice().sort(compareKeys);
            const firstKey = backwards ? sortedKeys[sortedKeys.length - 1] : sortedKeys[0];
            const lastKey = backwards ? sortedKeys[0] : sortedKeys[sortedKeys.length - 1];
            const cursor = this._target.openKeyCursor(IDBKeyRange.bound(firstKey, lastKey), direction);
            let i = 0;
            let consumerDone = false;
            await iterateCursor(cursor, (value, key) => {
                // while key is larger than next key, advance and report false
                while(i < sortedKeys.length && compareKeys(sortedKeys[i], key) < 0 && !consumerDone) {
                    consumerDone = callback(sortedKeys[i], false);
                    ++i;
                }
                if (i < sortedKeys.length && compareKeys(sortedKeys[i], key) === 0 && !consumerDone) {
                    consumerDone = callback(sortedKeys[i], true);
                    ++i;
                }
                const done = consumerDone || i >= sortedKeys.length;
                const jumpTo = !done && sortedKeys[i];
                return {done, jumpTo};
            });
            // report null for keys we didn't to at the end
            while (!consumerDone && i < sortedKeys.length) {
                consumerDone = callback(sortedKeys[i], false);
                ++i;
            }
        }

        _reduce(range, reducer, initialValue, direction) {
            let reducedValue = initialValue;
            const cursor = this._openCursor(range, direction);
            return iterateCursor(cursor, (value) => {
                reducedValue = reducer(reducedValue, value);
                return {done: false};
            });
        }

        _selectLimit(range, amount, direction) {
            return this._selectWhile(range, (results) => {
                return results.length === amount;
            }, direction);
        }

        async _selectWhile(range, predicate, direction) {
            const cursor = this._openCursor(range, direction);
            const results = [];
            await iterateCursor(cursor, (value) => {
                results.push(value);
                return {done: predicate(results)};
            });
            return results;
        }

        async _find(range, predicate, direction) {
            const cursor = this._openCursor(range, direction);
            let result;
            const found = await iterateCursor(cursor, (value) => {
                const found = predicate(value);
                if (found) {
                    result = value;
                }
                return {done: found};
            });
            if (found) {
                return result;
            }
        }
    }

    class QueryTargetWrapper {
        constructor(qt) {
            this._qt = qt;
        }

        supports(methodName) {
            return !!this._qt[methodName];
        }
        
        openKeyCursor(...params) {
            // not supported on Edge 15
            if (!this._qt.openKeyCursor) {
                return this.openCursor(...params);
            }
            try {
                return this._qt.openKeyCursor(...params);
            } catch(err) {
                throw new StorageError("openKeyCursor failed", err);
            }
        }
        
        openCursor(...params) {
            try {
                return this._qt.openCursor(...params);
            } catch(err) {
                throw new StorageError("openCursor failed", err);
            }
        }

        put(...params) {
            try {
                return this._qt.put(...params);
            } catch(err) {
                throw new StorageError("put failed", err);
            }
        }

        add(...params) {
            try {
                return this._qt.add(...params);
            } catch(err) {
                throw new StorageError("add failed", err);
            }
        }

        get(...params) {
            try {
                return this._qt.get(...params);
            } catch(err) {
                throw new StorageError("get failed", err);
            }
        }
        
        getKey(...params) {
            try {
                return this._qt.getKey(...params);
            } catch(err) {
                throw new StorageError("getKey failed", err);
            }
        }

        delete(...params) {
            try {
                return this._qt.delete(...params);
            } catch(err) {
                throw new StorageError("delete failed", err);
            }
        }

        index(...params) {
            try {
                return this._qt.index(...params);
            } catch(err) {
                throw new StorageError("index failed", err);
            }
        }
    }

    class Store extends QueryTarget {
        constructor(idbStore) {
            super(new QueryTargetWrapper(idbStore));
        }

        get _idbStore() {
            return this._target;
        }

        index(indexName) {
            return new QueryTarget(new QueryTargetWrapper(this._idbStore.index(indexName)));
        }

        async put(value) {
            try {
                return await reqAsPromise(this._idbStore.put(value));
            } catch(err) {
                const originalErr = err.cause;
                throw new StorageError(`put on ${this._idbStore.name} failed`, originalErr, value);
            }
        }

        async add(value) {
            try {
                return await reqAsPromise(this._idbStore.add(value));
            } catch(err) {
                const originalErr = err.cause;
                throw new StorageError(`add on ${this._idbStore.name} failed`, originalErr, value);
            }
        }

        delete(keyOrKeyRange) {
            return reqAsPromise(this._idbStore.delete(keyOrKeyRange));
        }
    }

    /**
    store contains:
    	loginData {
    		device_id
    		home_server
    		access_token
    		user_id
    	}
    	// flags {
    	// 	lazyLoading?
    	// }
    	syncToken
    	displayName
    	avatarUrl
    	lastSynced
    */
    class SessionStore {
    	constructor(sessionStore) {
    		this._sessionStore = sessionStore;
    	}

    	async get() {
    		const session = await this._sessionStore.selectFirst(IDBKeyRange.only(1));
    		if (session) {
    			return session.value;
    		}
    	}

    	set(session) {
    		return this._sessionStore.put({key: 1, value: session});
    	}
    }

    /**
    store contains:
    	roomId
    	name
    	lastMessage
    	unreadCount
    	mentionCount
    	isEncrypted
    	isDirectMessage
    	membership
    	inviteCount
    	joinCount
    */
    class RoomSummaryStore {
    	constructor(summaryStore) {
    		this._summaryStore = summaryStore;
    	}

    	getAll() {
    		return this._summaryStore.selectAll();
    	}

    	set(summary) {
    		return this._summaryStore.put(summary);
    	}
    }

    function encodeKey(roomId, fragmentId, eventIndex) {
        return `${roomId}|${encodeUint32(fragmentId)}|${encodeUint32(eventIndex)}`;
    }

    function encodeEventIdKey(roomId, eventId) {
        return `${roomId}|${eventId}`;
    }

    function decodeEventIdKey(eventIdKey) {
        const [roomId, eventId] = eventIdKey.split("|");
        return {roomId, eventId};
    }

    class Range {
        constructor(only, lower, upper, lowerOpen, upperOpen) {
            this._only = only;
            this._lower = lower;
            this._upper = upper;
            this._lowerOpen = lowerOpen;
            this._upperOpen = upperOpen;
        }

        asIDBKeyRange(roomId) {
            try {
                // only
                if (this._only) {
                    return IDBKeyRange.only(encodeKey(roomId, this._only.fragmentId, this._only.eventIndex));
                }
                // lowerBound
                // also bound as we don't want to move into another roomId
                if (this._lower && !this._upper) {
                    return IDBKeyRange.bound(
                        encodeKey(roomId, this._lower.fragmentId, this._lower.eventIndex),
                        encodeKey(roomId, this._lower.fragmentId, WebPlatform.maxStorageKey),
                        this._lowerOpen,
                        false
                    );
                }
                // upperBound
                // also bound as we don't want to move into another roomId
                if (!this._lower && this._upper) {
                    return IDBKeyRange.bound(
                        encodeKey(roomId, this._upper.fragmentId, WebPlatform.minStorageKey),
                        encodeKey(roomId, this._upper.fragmentId, this._upper.eventIndex),
                        false,
                        this._upperOpen
                    );
                }
                // bound
                if (this._lower && this._upper) {
                    return IDBKeyRange.bound(
                        encodeKey(roomId, this._lower.fragmentId, this._lower.eventIndex),
                        encodeKey(roomId, this._upper.fragmentId, this._upper.eventIndex),
                        this._lowerOpen,
                        this._upperOpen
                    );
                }
            } catch(err) {
                throw new StorageError(`IDBKeyRange failed with data: ` + JSON.stringify(this), err);
            }
        }
    }
    /*
     * @typedef   {Object} Gap
     * @property  {?string} prev_batch the pagination token for this backwards facing gap
     * @property  {?string} next_batch the pagination token for this forwards facing gap
     *
     * @typedef   {Object} Event
     * @property  {string} event_id the id of the event
     * @property  {string} type the
     * @property  {?string} state_key the state key of this state event
     *
     * @typedef   {Object} Entry
     * @property  {string} roomId
     * @property  {EventKey} eventKey
     * @property  {?Event} event if an event entry, the event
     * @property  {?Gap} gap if a gap entry, the gap
    */
    class TimelineEventStore {
        constructor(timelineStore) {
            this._timelineStore = timelineStore;
        }

        /** Creates a range that only includes the given key
         *  @param {EventKey} eventKey the key
         *  @return {Range} the created range
         */
        onlyRange(eventKey) {
            return new Range(eventKey);
        }

        /** Creates a range that includes all keys before eventKey, and optionally also the key itself.
         *  @param {EventKey} eventKey the key
         *  @param {boolean} [open=false] whether the key is included (false) or excluded (true) from the range at the upper end.
         *  @return {Range} the created range
         */
        upperBoundRange(eventKey, open=false) {
            return new Range(undefined, undefined, eventKey, undefined, open);
        }

        /** Creates a range that includes all keys after eventKey, and optionally also the key itself.
         *  @param {EventKey} eventKey the key
         *  @param {boolean} [open=false] whether the key is included (false) or excluded (true) from the range at the lower end.
         *  @return {Range} the created range
         */
        lowerBoundRange(eventKey, open=false) {
            return new Range(undefined, eventKey, undefined, open);
        }

        /** Creates a range that includes all keys between `lower` and `upper`, and optionally the given keys as well.
         *  @param {EventKey} lower the lower key
         *  @param {EventKey} upper the upper key
         *  @param {boolean} [lowerOpen=false] whether the lower key is included (false) or excluded (true) from the range.
         *  @param {boolean} [upperOpen=false] whether the upper key is included (false) or excluded (true) from the range.
         *  @return {Range} the created range
         */
        boundRange(lower, upper, lowerOpen=false, upperOpen=false) {
            return new Range(undefined, lower, upper, lowerOpen, upperOpen);
        }

        /** Looks up the last `amount` entries in the timeline for `roomId`.
         *  @param  {string} roomId
         *  @param  {number} fragmentId
         *  @param  {number} amount
         *  @return {Promise<Entry[]>} a promise resolving to an array with 0 or more entries, in ascending order.
         */
        async lastEvents(roomId, fragmentId, amount) {
            const eventKey = EventKey.maxKey;
            eventKey.fragmentId = fragmentId;
            return this.eventsBefore(roomId, eventKey, amount);
        }

        /** Looks up the first `amount` entries in the timeline for `roomId`.
         *  @param  {string} roomId
         *  @param  {number} fragmentId
         *  @param  {number} amount
         *  @return {Promise<Entry[]>} a promise resolving to an array with 0 or more entries, in ascending order.
         */
        async firstEvents(roomId, fragmentId, amount) {
            const eventKey = EventKey.minKey;
            eventKey.fragmentId = fragmentId;
            return this.eventsAfter(roomId, eventKey, amount);
        }

        /** Looks up `amount` entries after `eventKey` in the timeline for `roomId` within the same fragment.
         *  The entry for `eventKey` is not included.
         *  @param  {string} roomId
         *  @param  {EventKey} eventKey
         *  @param  {number} amount
         *  @return {Promise<Entry[]>} a promise resolving to an array with 0 or more entries, in ascending order.
         */
        eventsAfter(roomId, eventKey, amount) {
            const idbRange = this.lowerBoundRange(eventKey, true).asIDBKeyRange(roomId);
            return this._timelineStore.selectLimit(idbRange, amount);
        }

        /** Looks up `amount` entries before `eventKey` in the timeline for `roomId` within the same fragment.
         *  The entry for `eventKey` is not included.
         *  @param  {string} roomId
         *  @param  {EventKey} eventKey
         *  @param  {number} amount
         *  @return {Promise<Entry[]>} a promise resolving to an array with 0 or more entries, in ascending order.
         */
        async eventsBefore(roomId, eventKey, amount) {
            const range = this.upperBoundRange(eventKey, true).asIDBKeyRange(roomId);
            const events = await this._timelineStore.selectLimitReverse(range, amount);
            events.reverse(); // because we fetched them backwards
            return events;
        }

        /** Finds the first eventId that occurs in the store, if any.
         *  For optimal performance, `eventIds` should be in chronological order.
         *
         *  The order in which results are returned might be different than `eventIds`.
         *  Call the return value to obtain the next {id, event} pair.
         *  @param  {string} roomId
         *  @param  {string[]} eventIds
         *  @return {Function<Promise>}
         */
        // performance comment from above refers to the fact that there *might*
        // be a correlation between event_id sorting order and chronology.
        // In that case we could avoid running over all eventIds, as the reported order by findExistingKeys
        // would match the order of eventIds. That's why findLast is also passed as backwards to keysExist.
        // also passing them in chronological order makes sense as that's how we'll receive them almost always.
        async findFirstOccurringEventId(roomId, eventIds) {
            const byEventId = this._timelineStore.index("byEventId");
            const keys = eventIds.map(eventId => encodeEventIdKey(roomId, eventId));
            const results = new Array(keys.length);
            let firstFoundKey;

            // find first result that is found and has no undefined results before it
            function firstFoundAndPrecedingResolved() {
                for(let i = 0; i < results.length; ++i) {
                    if (results[i] === undefined) {
                        return;
                    } else if(results[i] === true) {
                        return keys[i];
                    }
                }
            }

            await byEventId.findExistingKeys(keys, false, (key, found) => {
                const index = keys.indexOf(key);
                results[index] = found;
                firstFoundKey = firstFoundAndPrecedingResolved();
                return !!firstFoundKey;
            });
            return firstFoundKey && decodeEventIdKey(firstFoundKey).eventId;
        }

        /** Inserts a new entry into the store. The combination of roomId and eventKey should not exist yet, or an error is thrown.
         *  @param  {Entry} entry the entry to insert
         *  @return {Promise<>} a promise resolving to undefined if the operation was successful, or a StorageError if not.
         *  @throws {StorageError} ...
         */
        insert(entry) {
            entry.key = encodeKey(entry.roomId, entry.fragmentId, entry.eventIndex);
            entry.eventIdKey = encodeEventIdKey(entry.roomId, entry.event.event_id);
            // TODO: map error? or in idb/store?
            return this._timelineStore.add(entry);
        }

        /** Updates the entry into the store with the given [roomId, eventKey] combination.
         *  If not yet present, will insert. Might be slower than add.
         *  @param  {Entry} entry the entry to update.
         *  @return {Promise<>} a promise resolving to undefined if the operation was successful, or a StorageError if not.
         */
        update(entry) {
            return this._timelineStore.put(entry);
        }

        get(roomId, eventKey) {
            return this._timelineStore.get(encodeKey(roomId, eventKey.fragmentId, eventKey.eventIndex));
        }
        // returns the entries as well!! (or not always needed? I guess not always needed, so extra method)
        removeRange(roomId, range) {
            // TODO: read the entries!
            return this._timelineStore.delete(range.asIDBKeyRange(roomId));
        }

        getByEventId(roomId, eventId) {
            return this._timelineStore.index("byEventId").get(encodeEventIdKey(roomId, eventId));
        }
    }

    class RoomStateStore {
    	constructor(idbStore) {
    		this._roomStateStore = idbStore;
    	}

    	async getEvents(type) {

    	}

    	async getEventsForKey(type, stateKey) {

    	}

    	async setStateEvent(roomId, event) {
            const key = `${roomId}|${event.type}|${event.state_key}`;
            const entry = {roomId, event, key};
    		return this._roomStateStore.put(entry);
    	}
    }

    function encodeKey$1(roomId, fragmentId) {
        return `${roomId}|${encodeUint32(fragmentId)}`;
    }

    class TimelineFragmentStore {
        constructor(store) {
            this._store = store;
        }

        _allRange(roomId) {
            try {
                return IDBKeyRange.bound(
                    encodeKey$1(roomId, WebPlatform.minStorageKey),
                    encodeKey$1(roomId, WebPlatform.maxStorageKey)
                );
            } catch (err) {
                throw new StorageError(`error from IDBKeyRange with roomId ${roomId}`, err);
            }
        }

        all(roomId) {
            return this._store.selectAll(this._allRange(roomId));
        }

        /** Returns the fragment without a nextToken and without nextId,
        if any, with the largest id if there are multiple (which should not happen) */
        liveFragment(roomId) {
            // why do we need this?
            // Ok, take the case where you've got a /context fragment and a /sync fragment
            // They are not connected. So, upon loading the persister, which one do we take? We can't sort them ...
            // we assume that the one without a nextToken and without a nextId is a live one
            // there should really be only one like this

            // reverse because assuming live fragment has bigger id than non-live ones
            return this._store.findReverse(this._allRange(roomId), fragment => {
                return typeof fragment.nextId !== "number" && typeof fragment.nextToken !== "string";
            });
        }

        // should generate an id an return it?
        // depends if we want to do anything smart with fragment ids,
        // like give them meaning depending on range. not for now probably ...
        add(fragment) {
            fragment.key = encodeKey$1(fragment.roomId, fragment.id);
            return this._store.add(fragment);
        }

        update(fragment) {
            return this._store.put(fragment);
        }

        get(roomId, fragmentId) {
            return this._store.get(encodeKey$1(roomId, fragmentId));
        }
    }

    function encodeKey$2(roomId, queueIndex) {
        return `${roomId}|${encodeUint32(queueIndex)}`;
    }

    function decodeKey(key) {
        const [roomId, encodedQueueIndex] = key.split("|");
        const queueIndex = decodeUint32(encodedQueueIndex);
        return {roomId, queueIndex};
    }

    class PendingEventStore {
        constructor(eventStore) {
            this._eventStore = eventStore;
        }

        async getMaxQueueIndex(roomId) {
            const range = IDBKeyRange.bound(
                encodeKey$2(roomId, WebPlatform.minStorageKey),
                encodeKey$2(roomId, WebPlatform.maxStorageKey),
                false,
                false,
            );
            const maxKey = await this._eventStore.findMaxKey(range);
            if (maxKey) {
                return decodeKey(maxKey).queueIndex;
            }
        }

        remove(roomId, queueIndex) {
            const keyRange = IDBKeyRange.only(encodeKey$2(roomId, queueIndex));
            this._eventStore.delete(keyRange);
        }

        async exists(roomId, queueIndex) {
            const keyRange = IDBKeyRange.only(encodeKey$2(roomId, queueIndex));
            let key;
            if (this._eventStore.supports("getKey")) {
                key = await this._eventStore.getKey(keyRange);
            } else {
                const value = await this._eventStore.get(keyRange);
                key = value && value.key;
            }
            return !!key;
        }
        
        add(pendingEvent) {
            pendingEvent.key = encodeKey$2(pendingEvent.roomId, pendingEvent.queueIndex);
            return this._eventStore.add(pendingEvent);
        }

        update(pendingEvent) {
            return this._eventStore.put(pendingEvent);
        }

        getAll() {
            return this._eventStore.selectAll();
        }
    }

    class Transaction {
        constructor(txn, allowedStoreNames) {
            this._txn = txn;
            this._allowedStoreNames = allowedStoreNames;
            this._stores = {
                session: null,
                roomSummary: null,
                roomTimeline: null,
                roomState: null,
            };
        }

        _idbStore(name) {
            if (!this._allowedStoreNames.includes(name)) {
                // more specific error? this is a bug, so maybe not ...
                throw new StorageError(`Invalid store for transaction: ${name}, only ${this._allowedStoreNames.join(", ")} are allowed.`);
            }
            return new Store(this._txn.objectStore(name));
        }

        _store(name, mapStore) {
            if (!this._stores[name]) {
                const idbStore = this._idbStore(name);
                this._stores[name] = mapStore(idbStore);
            }
            return this._stores[name];
        }

        get session() {
            return this._store("session", idbStore => new SessionStore(idbStore));
        }

        get roomSummary() {
            return this._store("roomSummary", idbStore => new RoomSummaryStore(idbStore));
        }

        get timelineFragments() {
            return this._store("timelineFragments", idbStore => new TimelineFragmentStore(idbStore));
        }

        get timelineEvents() {
            return this._store("timelineEvents", idbStore => new TimelineEventStore(idbStore));
        }

        get roomState() {
            return this._store("roomState", idbStore => new RoomStateStore(idbStore));
        }

        get pendingEvents() {
            return this._store("pendingEvents", idbStore => new PendingEventStore(idbStore));
        }

        complete() {
            return txnAsPromise(this._txn);
        }

        abort() {
            this._txn.abort();
        }
    }

    class Storage {
        constructor(idbDatabase) {
            this._db = idbDatabase;
            const nameMap = STORE_NAMES.reduce((nameMap, name) => {
                nameMap[name] = name;
                return nameMap;
            }, {});
            this.storeNames = Object.freeze(nameMap);
        }

        _validateStoreNames(storeNames) {
            const idx = storeNames.findIndex(name => !STORE_NAMES.includes(name));
            if (idx !== -1) {
                throw new StorageError(`Tried top, a transaction unknown store ${storeNames[idx]}`);
            }
        }

        async readTxn(storeNames) {
            this._validateStoreNames(storeNames);
            try {
                const txn = this._db.transaction(storeNames, "readonly");
                return new Transaction(txn, storeNames);
            } catch(err) {
                throw new StorageError("readTxn failed", err);
            }
        }

        async readWriteTxn(storeNames) {
            this._validateStoreNames(storeNames);
            try {
                const txn = this._db.transaction(storeNames, "readwrite");
                return new Transaction(txn, storeNames);
            } catch(err) {
                throw new StorageError("readWriteTxn failed", err);
            }
        }

        close() {
            this._db.close();
        }
    }

    async function exportSession(db) {
        const NOT_DONE = {done: false};
        const txn = db.transaction(STORE_NAMES, "readonly");
        const data = {};
        await Promise.all(STORE_NAMES.map(async name => {
            const results = data[name] = [];  // initialize in deterministic order
            const store = txn.objectStore(name);
            await iterateCursor(store.openCursor(), (value) => {
                results.push(value);
                return NOT_DONE;
            });
        }));
        return data;
    }

    async function importSession(db, data) {
        const txn = db.transaction(STORE_NAMES, "readwrite");
        for (const name of STORE_NAMES) {
            const store = txn.objectStore(name);
            for (const value of data[name]) {
                store.add(value);
            }
        }
        await txnAsPromise(txn);
    }

    const sessionName = sessionId => `brawl_session_${sessionId}`;
    const openDatabaseWithSessionId = sessionId => openDatabase(sessionName(sessionId), createStores, 1);

    class StorageFactory {
        async create(sessionId) {
            const db = await openDatabaseWithSessionId(sessionId);
            return new Storage(db);
        }

        delete(sessionId) {
            const databaseName = sessionName(sessionId);
            const req = window.indexedDB.deleteDatabase(databaseName);
            return reqAsPromise(req);
        }

        async export(sessionId) {
            const db = await openDatabaseWithSessionId(sessionId);
            return await exportSession(db);
        }

        async import(sessionId, data) {
            const db = await openDatabaseWithSessionId(sessionId);
            return await importSession(db, data);
        }
    }

    function createStores(db) {
        db.createObjectStore("session", {keyPath: "key"});
        // any way to make keys unique here? (just use put?)
        db.createObjectStore("roomSummary", {keyPath: "roomId"});

        // need index to find live fragment? prooobably ok without for now
        //key = room_id | fragment_id
        db.createObjectStore("timelineFragments", {keyPath: "key"});
        //key = room_id | fragment_id | event_index
        const timelineEvents = db.createObjectStore("timelineEvents", {keyPath: "key"});
        //eventIdKey = room_id | event_id
        timelineEvents.createIndex("byEventId", "eventIdKey", {unique: true});
        //key = room_id | event.type | event.state_key,
        db.createObjectStore("roomState", {keyPath: "key"});
        db.createObjectStore("pendingEvents", {keyPath: "key"});
        
        // const roomMembers = db.createObjectStore("roomMembers", {keyPath: [
        //  "event.room_id",
        //  "event.content.membership",
        //  "event.state_key"
        // ]});
        // roomMembers.createIndex("byName", ["room_id", "content.name"]);
    }

    class SessionInfoStorage {
        constructor(name) {
            this._name = name;
        }

        getAll() {
            const sessionsJson = localStorage.getItem(this._name);
            if (sessionsJson) {
                const sessions = JSON.parse(sessionsJson);
                if (Array.isArray(sessions)) {
                    return Promise.resolve(sessions);
                }
            }
            return Promise.resolve([]);
        }

        async hasAnySession() {
            const all = await this.getAll();
            return all && all.length > 0;
        }

        async updateLastUsed(id, timestamp) {
            const sessions = await this.getAll();
            if (sessions) {
                const session = sessions.find(session => session.id === id);
                if (session) {
                    session.lastUsed = timestamp;
                    localStorage.setItem(this._name, JSON.stringify(sessions));
                }
            }
        }

        async get(id) {
            const sessions = await this.getAll();
            if (sessions) {
                return sessions.find(session => session.id === id);
            }
        }

        async add(sessionInfo) {
            const sessions = await this.getAll();
            sessions.push(sessionInfo);
            localStorage.setItem(this._name, JSON.stringify(sessions));
        }

        async delete(sessionId) {
            let sessions = await this.getAll();
            sessions = sessions.filter(s => s.id !== sessionId);
            localStorage.setItem(this._name, JSON.stringify(sessions));
        }
        
    }

    function avatarInitials(name) {
        const words = name.split(" ").slice(0, 2);
        return words.reduce((i, w) => i + w.charAt(0).toUpperCase(), "");
    }

    class RoomTileViewModel {
        // we use callbacks to parent VM instead of emit because
        // it would be annoying to keep track of subscriptions in
        // parent for all RoomTileViewModels
        // emitUpdate is ObservableMap/ObservableList update mechanism
        constructor({room, emitUpdate, emitOpen}) {
            this._room = room;
            this._emitUpdate = emitUpdate;
            this._emitOpen = emitOpen;
        }

        open() {
            this._emitOpen(this._room);
        }

        compare(other) {
            // sort by name for now
            return this._room.name.localeCompare(other._room.name);
        }

        get name() {
            return this._room.name;
        }

        get avatarInitials() {
            return avatarInitials(this._room.name);
        }
    }

    class UpdateAction {
        constructor(remove, update, updateParams) {
            this._remove = remove;
            this._update = update;
            this._updateParams = updateParams;
        }

        get shouldRemove() {
            return this._remove;
        }

        get shouldUpdate() {
            return this._update;
        }

        get updateParams() {
            return this._updateParams;
        }

        static Remove() {
            return new UpdateAction(true, false, null);
        }

        static Update(newParams) {
            return new UpdateAction(false, true, newParams);
        }

        static Nothing() {
            return new UpdateAction(false, false, null);
        }
    }

    // maps 1..n entries to 0..1 tile. Entries are what is stored in the timeline, either an event or fragmentboundary
    // for now, tileCreator should be stable in whether it returns a tile or not.
    // e.g. the decision to create a tile or not should be based on properties
    // not updated later on (e.g. event type)
    // also see big comment in onUpdate
    class TilesCollection extends BaseObservableList {
        constructor(entries, tileCreator) {
            super();
            this._entries = entries;
            this._tiles = null;
            this._entrySubscription = null;
            this._tileCreator = tileCreator;
            this._emitSpontanousUpdate = this._emitSpontanousUpdate.bind(this);
        }

        _emitSpontanousUpdate(tile, params) {
            const entry = tile.lowerEntry;
            const tileIdx = this._findTileIdx(entry);
            this.emitUpdate(tileIdx, tile, params);
        }

        onSubscribeFirst() {
            this._entrySubscription = this._entries.subscribe(this);
            this._populateTiles();
        }

        _populateTiles() {
            this._tiles = [];
            let currentTile = null;
            for (let entry of this._entries) {
                if (!currentTile || !currentTile.tryIncludeEntry(entry)) {
                    currentTile = this._tileCreator(entry);
                    if (currentTile) {
                        this._tiles.push(currentTile);
                    }
                }
            }
            let prevTile = null;
            for (let tile of this._tiles) {
                if (prevTile) {
                    prevTile.updateNextSibling(tile);
                }
                tile.updatePreviousSibling(prevTile);
                prevTile = tile;
            }
            if (prevTile) {
                prevTile.updateNextSibling(null);
            }
            // now everything is wired up,
            // allow tiles to emit updates
            for (const tile of this._tiles) {
                tile.setUpdateEmit(this._emitSpontanousUpdate);
            }
        }

        _findTileIdx(entry) {
            return sortedIndex(this._tiles, entry, (entry, tile) => {
                // negate result because we're switching the order of the params
                return -tile.compareEntry(entry);
            });
        }

        _findTileAtIdx(entry, idx) {
            const tile = this._getTileAtIdx(idx);
            if (tile && tile.compareEntry(entry) === 0) {
                return tile;
            }
        }

        _getTileAtIdx(tileIdx) {
            if (tileIdx >= 0 && tileIdx < this._tiles.length) {
                return this._tiles[tileIdx];
            }
            return null;
        }

        onUnsubscribeLast() {
            this._entrySubscription = this._entrySubscription();
            this._tiles = null;
        }

        onReset() {
            // if TileViewModel were disposable, dispose here, or is that for views to do? views I suppose ...
            this._buildInitialTiles();
            this.emitReset();
        }

        onAdd(index, entry) {
            const tileIdx = this._findTileIdx(entry);
            const prevTile = this._getTileAtIdx(tileIdx - 1);
            if (prevTile && prevTile.tryIncludeEntry(entry)) {
                this.emitUpdate(tileIdx - 1, prevTile);
                return;
            }
            // not + 1 because this entry hasn't been added yet
            const nextTile = this._getTileAtIdx(tileIdx);
            if (nextTile && nextTile.tryIncludeEntry(entry)) {
                this.emitUpdate(tileIdx, nextTile);
                return;
            }

            const newTile = this._tileCreator(entry);
            if (newTile) {
                if (prevTile) {
                    prevTile.updateNextSibling(newTile);
                    // this emits an update while the add hasn't been emitted yet
                    newTile.updatePreviousSibling(prevTile);
                }
                if (nextTile) {
                    newTile.updateNextSibling(nextTile);
                    nextTile.updatePreviousSibling(newTile);
                }
                this._tiles.splice(tileIdx, 0, newTile);
                this.emitAdd(tileIdx, newTile);
                // add event is emitted, now the tile
                // can emit updates
                newTile.setUpdateEmit(this._emitSpontanousUpdate);
            }
            // find position by sort key
            // ask siblings to be included? both? yes, twice: a (insert c here) b, ask a(c), if yes ask b(a), else ask b(c)? if yes then b(a)?
        }

        onUpdate(index, entry, params) {
            const tileIdx = this._findTileIdx(entry);
            const tile = this._findTileAtIdx(entry, tileIdx);
            if (tile) {
                const action = tile.updateEntry(entry, params);
                if (action.shouldRemove) {
                    this._removeTile(tileIdx, tile);
                }
                if (action.shouldUpdate) {
                    this.emitUpdate(tileIdx, tile, action.updateParams);
                }
            }
            // technically we should handle adding a tile here as well
            // in case before we didn't have a tile for it but now we do
            // but in reality we don't have this use case as the type and msgtype
            // doesn't change. Decryption maybe is the exception?


            // outcomes here can be
            //   tiles should be removed (got redacted and we don't want it in the timeline)
            //   tile should be added where there was none before ... ?
            //   entry should get it's own tile now
            //   merge with neighbours? ... hard to imagine use case for this  ...
        }

        _removeTile(tileIdx, tile) {
            const prevTile = this._getTileAtIdx(tileIdx - 1);
            const nextTile = this._getTileAtIdx(tileIdx + 1);
            this._tiles.splice(tileIdx, 1);
            prevTile && prevTile.updateNextSibling(nextTile);
            nextTile && nextTile.updatePreviousSibling(prevTile);
            tile.setUpdateEmit(null);
            this.emitRemove(tileIdx, tile);
        }

        // would also be called when unloading a part of the timeline
        onRemove(index, entry) {
            const tileIdx = this._findTileIdx(entry);
            const tile = this._findTileAtIdx(entry, tileIdx);
            if (tile) {
                const removeTile = tile.removeEntry(entry);
                if (removeTile) {
                    this._removeTile(tileIdx, tile);
                } else {
                    this.emitUpdate(tileIdx, tile);
                }
            }
        }

        onMove(fromIdx, toIdx, value) {
            // this ... cannot happen in the timeline?
            // perhaps we can use this event to support a local echo (in a different fragment)
            // to be moved to the key of the remote echo, so we don't loose state ... ?
        }

        [Symbol.iterator]() {
            return this._tiles.values();
        }

        get length() {
            return this._tiles.length;
        }
    }

    class SimpleTile {
        constructor({entry}) {
            this._entry = entry;
            this._emitUpdate = null;
        }
        // view model props for all subclasses
        // hmmm, could also do instanceof ... ?
        get shape() {
            return null;
            // "gap" | "message" | "image" | ... ?
        }

        // don't show display name / avatar
        // probably only for MessageTiles of some sort?
        get isContinuation() {
            return false;
        }

        get hasDateSeparator() {
            return false;
        }

        emitUpdate(paramName) {
            if (this._emitUpdate) {
                this._emitUpdate(this, paramName);
            }
        }

        get internalId() {
            return this._entry.asEventKey().toString();
        }

        get isPending() {
            return this._entry.isPending;
        }
        // TilesCollection contract below
        setUpdateEmit(emitUpdate) {
            this._emitUpdate = emitUpdate;
        }

        get upperEntry() {
            return this._entry;
        }

        get lowerEntry() {
            return this._entry;
        }

        compareEntry(entry) {
            return this._entry.compare(entry);
        }

        // update received for already included (falls within sort keys) entry
        updateEntry(entry) {
            this._entry = entry;
            return UpdateAction.Nothing();
        }

        // return whether the tile should be removed
        // as SimpleTile only has one entry, the tile should be removed
        removeEntry(entry) {
            return true;
        }

        // SimpleTile can only contain 1 entry
        tryIncludeEntry() {
            return false;
        }
        // let item know it has a new sibling
        updatePreviousSibling(prev) {

        }

        // let item know it has a new sibling
        updateNextSibling(next) {
        
        }
        // TilesCollection contract above
    }

    class GapTile extends SimpleTile {
        constructor(options, timeline) {
            super(options);
            this._timeline = timeline;
            this._loading = false;
            this._error = null;
        }

        async fill() {
            // prevent doing this twice
            if (!this._loading) {
                this._loading = true;
                this.emitUpdate("isLoading");
                try {
                    await this._timeline.fillGap(this._entry, 10);
                } catch (err) {
                    console.error(`timeline.fillGap(): ${err.message}:\n${err.stack}`);
                    this._error = err;
                    this.emitUpdate("error");
                } finally {
                    this._loading = false;
                    this.emitUpdate("isLoading");
                }
            }
        }

        updateEntry(entry, params) {
            super.updateEntry(entry, params);
            if (!entry.isGap) {
                return UpdateAction.Remove();
            } else {
                return UpdateAction.Nothing();
            }
        }

        get shape() {
            return "gap";
        }

        get isLoading() {
            return this._loading;
        }

        get isUp() {
            return this._entry.direction.isBackward;
        }

        get isDown() {
            return this._entry.direction.isForward;
        }

        get error() {
            if (this._error) {
                const dir = this._entry.prev_batch ? "previous" : "next";
                return `Could not load ${dir} messages: ${this._error.message}`;
            }
            return null;
        }
    }

    class MessageTile extends SimpleTile {

        constructor(options) {
            super(options);
            this._isOwn = this._entry.sender === options.ownUserId;
            this._date = new Date(this._entry.timestamp);
            this._isContinuation = false;
        }

        get shape() {
            return "message";
        }

        get sender() {
            return this._entry.sender;
        }

        get date() {
            return this._date.toLocaleDateString({}, {month: "numeric", day: "numeric"});
        }

        get time() {
            return this._date.toLocaleTimeString({}, {hour: "numeric", minute: "2-digit"});
        }

        get isOwn() {
            return this._isOwn;
        }

        get isContinuation() {
            return this._isContinuation;
        }

        _getContent() {
            return this._entry.content;
        }

        updatePreviousSibling(prev) {
            super.updatePreviousSibling(prev);
            const isContinuation = prev && prev instanceof MessageTile && prev.sender === this.sender;
            if (isContinuation !== this._isContinuation) {
                this._isContinuation = isContinuation;
                this.emitUpdate("isContinuation");
            }
        }
    }

    class TextTile extends MessageTile {
        get text() {
            const content = this._getContent();
            const body = content && content.body;
            if (content.msgtype === "m.emote") {
                return `* ${this._entry.sender} ${body}`;
            } else {
                return body;
            }
        }
    }

    const MAX_HEIGHT = 300;
    const MAX_WIDTH = 400;

    class ImageTile extends MessageTile {
        constructor(options, room) {
            super(options);
            this._room = room;
        }

        get thumbnailUrl() {
            const mxcUrl = this._getContent().url;
            return this._room.mxcUrlThumbnail(mxcUrl, this.thumbnailWidth, this.thumbnailHeight, "scale");
        }

        get url() {
            const mxcUrl = this._getContent().url;
            return this._room.mxcUrl(mxcUrl);   
        }

        _scaleFactor() {
            const {info} = this._getContent();
            const scaleHeightFactor = MAX_HEIGHT / info.h;
            const scaleWidthFactor = MAX_WIDTH / info.w;
            // take the smallest scale factor, to respect all constraints
            // we should not upscale images, so limit scale factor to 1 upwards
            return Math.min(scaleWidthFactor, scaleHeightFactor, 1);
        }

        get thumbnailWidth() {
            const {info} = this._getContent();
            return Math.round(info.w * this._scaleFactor());
        }

        get thumbnailHeight() {
            const {info} = this._getContent();
            return Math.round(info.h * this._scaleFactor());
        }

        get label() {
            return this._getContent().body;
        }

        get shape() {
            return "image";
        }
    }

    /*
    map urls:
    apple:   https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
    android: https://developers.google.com/maps/documentation/urls/guide
    wp:      maps:49.275267 -122.988617
    https://www.habaneroconsulting.com/stories/insights/2011/opening-native-map-apps-from-the-mobile-browser
    */
    class LocationTile extends MessageTile {
        get mapsLink() {
            const geoUri = this._getContent().geo_uri;
            const [lat, long] = geoUri.split(":")[1].split(",");
            return `maps:${lat} ${long}`;
        }

        get label() {
            return `${this.sender} sent their location, click to see it in maps.`;
        }
    }

    class RoomNameTile extends SimpleTile {
        
        get shape() {
            return "announcement";
        }

        get announcement() {
            const content = this._entry.content;
            return `${this._entry.sender} named the room "${content.name}"`
        }
    }

    class RoomMemberTile extends SimpleTile {

        get shape() {
            return "announcement";
        }

        get announcement() {
            const {sender, content, prevContent, stateKey} = this._entry;
            const membership = content && content.membership;
            const prevMembership = prevContent && prevContent.membership;

            if (prevMembership === "join" && membership === "join") {
                if (content.avatar_url !== prevContent.avatar_url) {
                    return `${stateKey} changed their avatar`; 
                } else if (content.displayname !== prevContent.displayname) {
                    return `${stateKey} changed their name to ${content.displayname}`; 
                }
            } else if (membership === "join") {
                return `${stateKey} joined the room`;
            } else if (membership === "invite") {
                return `${stateKey} was invited to the room by ${sender}`;
            } else if (prevMembership === "invite") {
                if (membership === "join") {
                    return `${stateKey} accepted the invitation to join the room`;
                } else if (membership === "leave") {
                    return `${stateKey} declined the invitation to join the room`;
                }
            } else if (membership === "leave") {
                if (stateKey === sender) {
                    return `${stateKey} left the room`;
                } else {
                    const reason = content.reason;
                    return `${stateKey} was kicked from the room by ${sender}${reason ? `: ${reason}` : ""}`;
                }
            } else if (membership === "ban") {
                return `${stateKey} was banned from the room by ${sender}`;
            }
            
            return `${sender} membership changed to ${content.membership}`;
        }
    }

    function tilesCreator({room, ownUserId}) {
        return function tilesCreator(entry, emitUpdate) {
            const options = {entry, emitUpdate, ownUserId};
            if (entry.isGap) {
                return new GapTile(options, room);
            } else if (entry.eventType) {
                switch (entry.eventType) {
                    case "m.room.message": {
                        const content = entry.content;
                        const msgtype = content && content.msgtype;
                        switch (msgtype) {
                            case "m.text":
                            case "m.notice":
                            case "m.emote":
                                return new TextTile(options);
                            case "m.image":
                                return new ImageTile(options, room);
                            case "m.location":
                                return new LocationTile(options);
                            default:
                                // unknown msgtype not rendered
                                return null;
                        }
                    }
                    case "m.room.name":
                        return new RoomNameTile(options);
                    case "m.room.member":
                        return new RoomMemberTile(options);
                    default:
                        // unknown type not rendered
                        return null;
                }
            }
        }   
    }

    /*
    need better naming, but
    entry = event or gap from matrix layer
    tile = item on visual timeline like event, date separator?, group of joined events


    shall we put date separators as marker in EventViewItem or separate item? binary search will be complicated ...


    pagination ...

    on the timeline viewmodel (containing the TilesCollection?) we'll have a method to (un)load a tail or head of
    the timeline (counted in tiles), which results to a range in sortKeys we want on the screen. We pass that range
    to the room timeline, which unload entries from memory.
    when loading, it just reads events from a sortkey backwards or forwards...
    */

    class TimelineViewModel {
        constructor({room, timeline, ownUserId}) {
            this._timeline = timeline;
            // once we support sending messages we could do
            // timeline.entries.concat(timeline.pendingEvents)
            // for an ObservableList that also contains local echos
            this._tiles = new TilesCollection(timeline.entries, tilesCreator({room, ownUserId}));
        }

        // doesn't fill gaps, only loads stored entries/tiles
        loadAtTop() {
            return this._timeline.loadAtTop(50);
        }

        unloadAtTop(tileAmount) {
            // get lowerSortKey for tile at index tileAmount - 1
            // tell timeline to unload till there (included given key)
        }

        loadAtBottom() {

        }

        unloadAtBottom(tileAmount) {
            // get upperSortKey for tile at index tiles.length - tileAmount
            // tell timeline to unload till there (included given key)
        }

        get tiles() {
            return this._tiles;
        }
    }

    function disposeValue(value) {
        if (typeof value === "function") {
            value();
        } else {
            value.dispose();
        }
    }

    class Disposables {
        constructor() {
            this._disposables = [];
        }

        track(disposable) {
            this._disposables.push(disposable);
        }

        dispose() {
            if (this._disposables) {
                for (const d of this._disposables) {
                    disposeValue(d);
                }
                this._disposables = null;
            }
        }

        disposeTracked(value) {
            if (value === undefined || value === null) {
                return null;
            }
            const idx = this._disposables.indexOf(value);
            if (idx !== -1) {
                const [foundValue] = this._disposables.splice(idx, 1);
                disposeValue(foundValue);
            } else {
                console.warn("disposable not found, did it leak?", value);
            }
            return null;
        }
    }

    // ViewModel should just be an eventemitter, not an ObservableValue

    class ViewModel extends EventEmitter {
        constructor({clock} = {}) {
            super();
            this.disposables = null;
            this._options = {clock};
        }

        childOptions(explicitOptions) {
            return Object.assign({}, this._options, explicitOptions);
        }

        track(disposable) {
            if (!this.disposables) {
                this.disposables = new Disposables();
            }
            this.disposables.track(disposable);
            return disposable;
        }

        dispose() {
            if (this.disposables) {
                this.disposables.dispose();
            }
        }

        disposeTracked(disposable) {
            if (this.disposables) {
                return this.disposables.disposeTracked(disposable);
            }
            return null;
        }

        // TODO: this will need to support binding
        // if any of the expr is a function, assume the function is a binding, and return a binding function ourselves
        // 
        // translated string should probably always be bindings, unless we're fine with a refresh when changing the language?
        // we probably are, if we're using routing with a url, we could just refresh.
        i18n(parts, ...expr) {
            // just concat for now
            let result = "";
            for (let i = 0; i < parts.length; ++i) {
                result = result + parts[i];
                if (i < expr.length) {
                    result = result + expr[i];
                }
            }
            return result;
        }

        emitChange(changedProps) {
            this.emit("change", changedProps);
        }

        get clock() {
            return this._options.clock;
        }
    }

    class RoomViewModel extends ViewModel {
        constructor(options) {
            super(options);
            const {room, ownUserId, closeCallback} = options;
            this._room = room;
            this._ownUserId = ownUserId;
            this._timeline = null;
            this._timelineVM = null;
            this._onRoomChange = this._onRoomChange.bind(this);
            this._timelineError = null;
            this._sendError = null;
            this._closeCallback = closeCallback;
            this._composerVM = new ComposerViewModel(this);
        }

        async load() {
            this._room.on("change", this._onRoomChange);
            try {
                this._timeline = await this._room.openTimeline();
                this._timelineVM = new TimelineViewModel(this.childOptions({
                    room: this._room,
                    timeline: this._timeline,
                    ownUserId: this._ownUserId,
                }));
                this.emitChange("timelineViewModel");
            } catch (err) {
                console.error(`room.openTimeline(): ${err.message}:\n${err.stack}`);
                this._timelineError = err;
                this.emitChange("error");
            }
        }

        dispose() {
            // this races with enable, on the await openTimeline()
            if (this._timeline) {
                // will stop the timeline from delivering updates on entries
                this._timeline.close();
            }
        }

        close() {
            this._closeCallback();
        }

        // room doesn't tell us yet which fields changed,
        // so emit all fields originating from summary
        _onRoomChange() {
            this.emitChange("name");
        }

        get name() {
            return this._room.name;
        }

        get timelineViewModel() {
            return this._timelineVM;
        }

        get error() {
            if (this._timelineError) {
                return `Something went wrong loading the timeline: ${this._timelineError.message}`;
            }
            if (this._sendError) {
                return `Something went wrong sending your message: ${this._sendError.message}`;
            }
            return "";
        }

        get avatarInitials() {
            return avatarInitials(this._room.name);
        }


        
        async _sendMessage(message) {
            if (message) {
                try {
                    await this._room.sendEvent("m.room.message", {msgtype: "m.text", body: message});
                } catch (err) {
                    console.error(`room.sendMessage(): ${err.message}:\n${err.stack}`);
                    this._sendError = err;
                    this._timelineError = null;
                    this.emitChange("error");
                    return false;
                }
                return true;
            }
            return false;
        }

        get composerViewModel() {
            return this._composerVM;
        }
    }

    class ComposerViewModel {
        constructor(roomVM) {
            this._roomVM = roomVM;
        }

        sendMessage(message) {
            return this._roomVM._sendMessage(message);
        }
    }

    const SessionStatus = createEnum(
        "Disconnected",
        "Connecting",
        "FirstSync",
        "Sending",
        "Syncing",
        "SyncError"
    );

    class SessionStatusViewModel extends ViewModel {
        constructor(options) {
            super(options);
            const {sync, reconnector} = options;
            this._sync = sync;
            this._reconnector = reconnector;
            this._status = this._calculateState(reconnector.connectionStatus.get(), sync.status.get());
            
        }

        start() {
            const update = () => this._updateStatus();
            this.track(this._sync.status.subscribe(update));
            this.track(this._reconnector.connectionStatus.subscribe(update));
        }

        get isShown() {
            return this._status !== SessionStatus.Syncing;
        }

        get statusLabel() {
            switch (this._status) {
                case SessionStatus.Disconnected:{
                    const retryIn = Math.round(this._reconnector.retryIn / 1000);
                    return this.i18n`Disconnected, trying to reconnect in ${retryIn}s…`;
                }
                case SessionStatus.Connecting:
                    return this.i18n`Trying to reconnect now…`;
                case SessionStatus.FirstSync:
                    return this.i18n`Catching up with your conversations…`;
                case SessionStatus.SyncError:
                    return this.i18n`Sync failed because of ${this._sync.error}`;
            }
            return "";
        }

        get isWaiting() {
            switch (this._status) {
                case SessionStatus.Connecting:
                case SessionStatus.FirstSync:
                    return true;
                default:
                    return false;
            }
        }

        _updateStatus() {
            const newStatus = this._calculateState(
                this._reconnector.connectionStatus.get(),
                this._sync.status.get()
            );
            if (newStatus !== this._status) {
                if (newStatus === SessionStatus.Disconnected) {
                    this._retryTimer = this.track(this.clock.createInterval(() => {
                        this.emitChange("statusLabel");
                    }, 1000));
                } else {
                    this._retryTimer = this.disposeTracked(this._retryTimer);
                }
                this._status = newStatus;
                console.log("newStatus", newStatus);
                this.emitChange();
            }
        }

        _calculateState(connectionStatus, syncStatus) {
            if (connectionStatus !== ConnectionStatus.Online) {
                switch (connectionStatus) {
                    case ConnectionStatus.Reconnecting:
                        return SessionStatus.Connecting;
                    case ConnectionStatus.Waiting:
                        return SessionStatus.Disconnected;
                }
            } else if (syncStatus !== SyncStatus.Syncing) {
                switch (syncStatus) {
                    // InitialSync should be awaited in the SessionLoadViewModel,
                    // but include it here anyway
                    case SyncStatus.InitialSync:
                    case SyncStatus.CatchupSync:
                        return SessionStatus.FirstSync;
                    case SyncStatus.Stopped:
                        return SessionStatus.SyncError;
                }
            } /* else if (session.pendingMessageCount) {
                return SessionStatus.Sending;
            } */ else {
                return SessionStatus.Syncing;
            }
        }

        get isConnectNowShown() {
            return this._status === SessionStatus.Disconnected;
        }

        connectNow() {
            if (this.isConnectNowShown) {
                this._reconnector.tryNow();
            }
        }
    }

    class SessionViewModel extends ViewModel {
        constructor(options) {
            super(options);
            const {sessionContainer} = options;
            this._session = sessionContainer.session;
            this._sessionStatusViewModel = this.track(new SessionStatusViewModel(this.childOptions({
                sync: sessionContainer.sync,
                reconnector: sessionContainer.reconnector
            })));
            this._currentRoomViewModel = null;
            const roomTileVMs = this._session.rooms.mapValues((room, emitUpdate) => {
                return new RoomTileViewModel({
                    room,
                    emitUpdate,
                    emitOpen: room => this._openRoom(room)
                });
            });
            this._roomList = roomTileVMs.sortValues((a, b) => a.compare(b));
        }

        start() {
            this._sessionStatusViewModel.start();
        }

        get sessionStatusViewModel() {
            return this._sessionStatusViewModel;
        }

        get roomList() {
            return this._roomList;
        }

        get currentRoom() {
            return this._currentRoomViewModel;
        }

        _closeCurrentRoom() {
            if (this._currentRoomViewModel) {
                this._currentRoomViewModel = this.disposeTracked(this._currentRoomViewModel);
                this.emitChange("currentRoom");
            }
        }

        _openRoom(room) {
            if (this._currentRoomViewModel) {
                this._currentRoomViewModel = this.disposeTracked(this._currentRoomViewModel);
            }
            this._currentRoomViewModel = this.track(new RoomViewModel(this.childOptions({
                room,
                ownUserId: this._session.user.id,
                closeCallback: () => this._closeCurrentRoom(),
            })));
            this._currentRoomViewModel.load();
            this.emitChange("currentRoom");
        }
    }

    class SessionLoadViewModel extends ViewModel {
        constructor(options) {
            super(options);
            const {createAndStartSessionContainer, sessionCallback, homeserver, deleteSessionOnCancel} = options;
            this._createAndStartSessionContainer = createAndStartSessionContainer;
            this._sessionCallback = sessionCallback;
            this._homeserver = homeserver;
            this._deleteSessionOnCancel = deleteSessionOnCancel;
            this._loading = false;
            this._error = null;
        }

        async start() {
            if (this._loading) {
                return;
            }
            try {
                this._loading = true;
                this.emitChange();
                this._sessionContainer = this._createAndStartSessionContainer();
                this._waitHandle = this._sessionContainer.loadStatus.waitFor(s => {
                    this.emitChange();
                    // wait for initial sync, but not catchup sync
                    const isCatchupSync = s === LoadStatus.FirstSync &&
                        this._sessionContainer.sync.status.get() === SyncStatus.CatchupSync;
                    return isCatchupSync ||
                        s === LoadStatus.LoginFailed ||
                        s === LoadStatus.Error ||
                        s === LoadStatus.Ready;
                });
                try {
                    await this._waitHandle.promise;
                } catch (err) {
                    return; // aborted by goBack
                }
                // TODO: should we deal with no connection during initial sync 
                // and we're retrying as well here?
                // e.g. show in the label what is going on wrt connectionstatus
                // much like we will once you are in the app. Probably a good idea

                // did it finish or get stuck at LoginFailed or Error?
                const loadStatus = this._sessionContainer.loadStatus.get();
                if (loadStatus === LoadStatus.FirstSync || loadStatus === LoadStatus.Ready) {
                    this._sessionCallback(this._sessionContainer);
                }
            } catch (err) {
                this._error = err;
            } finally {
                this._loading = false;
                this.emitChange();
            }
        }


        async cancel() {
            try {
                if (this._sessionContainer) {
                    this._sessionContainer.stop();
                    if (this._deleteSessionOnCancel) {
                        await this._sessionContainer.deletSession();
                    }
                    this._sessionContainer = null;
                }
                if (this._waitHandle) {
                    // rejects with AbortError
                    this._waitHandle.dispose();
                    this._waitHandle = null;
                }
                this._sessionCallback();
            } catch (err) {
                this._error = err;
                this.emitChange();
            }
        }

        // to show a spinner or not
        get loading() {
            return this._loading;
        }

        get loadLabel() {
            const sc = this._sessionContainer;
            const error = this._error || (sc && sc.loadError);

            if (error || (sc && sc.loadStatus.get() === LoadStatus.Error)) {
                return `Something went wrong: ${error && error.message}.`;
            }

            if (sc) {
                switch (sc.loadStatus.get()) {
                    case LoadStatus.NotLoading:
                        return `Preparing…`;
                    case LoadStatus.Login:
                        return `Checking your login and password…`;
                    case LoadStatus.LoginFailed:
                        switch (sc.loginFailure) {
                            case LoginFailure.LoginFailure:
                                return `Your username and/or password don't seem to be correct.`;
                            case LoginFailure.Connection:
                                return `Can't connect to ${this._homeserver}.`;
                            case LoginFailure.Unknown:
                                return `Something went wrong while checking your login and password.`;
                        }
                        break;
                    case LoadStatus.Loading:
                        return `Loading your conversations…`;
                    case LoadStatus.FirstSync:
                        return `Getting your conversations from the server…`;
                    default:
                        return this._sessionContainer.loadStatus.get();
                }
            }

            return `Preparing…`;
        }
    }

    class LoginViewModel extends ViewModel {
        constructor(options) {
            super(options);
            const {sessionCallback, defaultHomeServer, createSessionContainer} = options;
            this._createSessionContainer = createSessionContainer;
            this._sessionCallback = sessionCallback;
            this._defaultHomeServer = defaultHomeServer;
            this._loadViewModel = null;
            this._loadViewModelSubscription = null;
        }

        get defaultHomeServer() { return this._defaultHomeServer; }

        get loadViewModel() {return this._loadViewModel; }

        get isBusy() {
            if (!this._loadViewModel) {
                return false;
            } else {
                return this._loadViewModel.loading;
            }
        }

        async login(username, password, homeserver) {
            this._loadViewModelSubscription = this.disposeTracked(this._loadViewModelSubscription);
            if (this._loadViewModel) {
                this._loadViewModel.cancel();
            }
            this._loadViewModel = new SessionLoadViewModel({
                createAndStartSessionContainer: () => {
                    const sessionContainer = this._createSessionContainer();
                    sessionContainer.startWithLogin(homeserver, username, password);
                    return sessionContainer;
                },
                sessionCallback: sessionContainer => {
                    if (sessionContainer) {
                        // make parent view model move away
                        this._sessionCallback(sessionContainer);
                    } else {
                        // show list of session again
                        this._loadViewModel = null;
                        this.emitChange("loadViewModel");
                    }
                },
                deleteSessionOnCancel: true,
                homeserver,
            });
            this._loadViewModel.start();
            this.emitChange("loadViewModel");
            this._loadViewModelSubscription = this.track(this._loadViewModel.disposableOn("change", () => {
                if (!this._loadViewModel.loading) {
                    this._loadViewModelSubscription = this.disposeTracked(this._loadViewModelSubscription);
                }
                this.emitChange("isBusy");
            }));
        }

        cancel() {
            if (!this.isBusy) {
                this._sessionCallback();
            }
        }
    }

    class SessionItemViewModel extends ViewModel {
        constructor(sessionInfo, pickerVM) {
            super({});
            this._pickerVM = pickerVM;
            this._sessionInfo = sessionInfo;
            this._isDeleting = false;
            this._isClearing = false;
            this._error = null;
            this._exportDataUrl = null;
        }

        get error() {
            return this._error && this._error.message;
        }

        async delete() {
            this._isDeleting = true;
            this.emitChange("isDeleting");
            try {
                await this._pickerVM.delete(this.id);
            } catch(err) {
                this._error = err;
                console.error(err);
                this.emitChange("error");
            } finally {
                this._isDeleting = false;
                this.emitChange("isDeleting");
            }
        }

        async clear() {
            this._isClearing = true;
            this.emitChange();
            try {
                await this._pickerVM.clear(this.id);
            } catch(err) {
                this._error = err;
                console.error(err);
                this.emitChange("error");
            } finally {
                this._isClearing = false;
                this.emitChange("isClearing");
            }
        }

        get isDeleting() {
            return this._isDeleting;
        }

        get isClearing() {
            return this._isClearing;
        }

        get id() {
            return this._sessionInfo.id;
        }

        get label() {
            const {userId, comment} =  this._sessionInfo;
            if (comment) {
                return `${userId} (${comment})`;
            } else {
                return userId;
            }
        }

        get sessionInfo() {
            return this._sessionInfo;
        }

        get exportDataUrl() {
            return this._exportDataUrl;
        }

        async export() {
            try {
                const data = await this._pickerVM._exportData(this._sessionInfo.id);
                const json = JSON.stringify(data, undefined, 2);
                const blob = new Blob([json], {type: "application/json"});
                this._exportDataUrl = URL.createObjectURL(blob);
                this.emitChange("exportDataUrl");
            } catch (err) {
                alert(err.message);
                console.error(err);
            }
        }

        clearExport() {
            if (this._exportDataUrl) {
                URL.revokeObjectURL(this._exportDataUrl);
                this._exportDataUrl = null;
                this.emitChange("exportDataUrl");
            }
        }
    }


    class SessionPickerViewModel extends ViewModel {
        constructor(options) {
            super(options);
            const {storageFactory, sessionInfoStorage, sessionCallback, createSessionContainer} = options;
            this._storageFactory = storageFactory;
            this._sessionInfoStorage = sessionInfoStorage;
            this._sessionCallback = sessionCallback;
            this._createSessionContainer = createSessionContainer;
            this._sessions = new SortedArray((s1, s2) => s1.id.localeCompare(s2.id));
            this._loadViewModel = null;
            this._error = null;
        }

        // this loads all the sessions
        async load() {
            const sessions = await this._sessionInfoStorage.getAll();
            this._sessions.setManyUnsorted(sessions.map(s => new SessionItemViewModel(s, this)));
        }

        // for the loading of 1 picked session
        get loadViewModel() {
            return this._loadViewModel;
        }

        async pick(id) {
            if (this._loadViewModel) {
                return;
            }
            const sessionVM = this._sessions.array.find(s => s.id === id);
            if (sessionVM) {
                this._loadViewModel = new SessionLoadViewModel({
                    createAndStartSessionContainer: () => {
                        const sessionContainer = this._createSessionContainer();
                        sessionContainer.startWithExistingSession(sessionVM.id);
                        return sessionContainer;
                    },
                    sessionCallback: sessionContainer => {
                        if (sessionContainer) {
                            // make parent view model move away
                            this._sessionCallback(sessionContainer);
                        } else {
                            // show list of session again
                            this._loadViewModel = null;
                            this.emitChange("loadViewModel");
                        }
                    }
                });
                this._loadViewModel.start();
                this.emitChange("loadViewModel");
            }
        }

        async _exportData(id) {
            const sessionInfo = await this._sessionInfoStorage.get(id);
            const stores = await this._storageFactory.export(id);
            const data = {sessionInfo, stores};
            return data;
        }

        async import(json) {
            const data = JSON.parse(json);
            const {sessionInfo} = data;
            sessionInfo.comment = `Imported on ${new Date().toLocaleString()} from id ${sessionInfo.id}.`;
            sessionInfo.id = this._createSessionContainer().createNewSessionId();
            await this._storageFactory.import(sessionInfo.id, data.stores);
            await this._sessionInfoStorage.add(sessionInfo);
            this._sessions.set(new SessionItemViewModel(sessionInfo, this));
        }

        async delete(id) {
            const idx = this._sessions.array.findIndex(s => s.id === id);
            await this._sessionInfoStorage.delete(id);
            await this._storageFactory.delete(id);
            this._sessions.remove(idx);
        }

        async clear(id) {
            await this._storageFactory.delete(id);
        }

        get sessions() {
            return this._sessions;
        }

        cancel() {
            if (!this._loadViewModel) {
                this._sessionCallback();
            }
        }
    }

    class BrawlViewModel extends ViewModel {
        constructor(options) {
            super(options);
            const {createSessionContainer, sessionInfoStorage, storageFactory} = options;
            this._createSessionContainer = createSessionContainer;
            this._sessionInfoStorage = sessionInfoStorage;
            this._storageFactory = storageFactory;

            this._error = null;
            this._sessionViewModel = null;
            this._loginViewModel = null;
            this._sessionPickerViewModel = null;

            this._sessionContainer = null;
            this._sessionCallback = this._sessionCallback.bind(this);
        }

        async load() {
            if (await this._sessionInfoStorage.hasAnySession()) {
                this._showPicker();
            } else {
                this._showLogin();
            }
        }

        _sessionCallback(sessionContainer) {
            if (sessionContainer) {
                this._setSection(() => {
                    this._sessionContainer = sessionContainer;
                    this._sessionViewModel = new SessionViewModel(this.childOptions({sessionContainer}));
                    this._sessionViewModel.start();
                });
            } else {
                // switch between picker and login
                if (this.activeSection === "login") {
                    this._showPicker();
                } else {
                    this._showLogin();
                }
            }
        }

        async _showPicker() {
            this._setSection(() => {
                this._sessionPickerViewModel = new SessionPickerViewModel({
                    sessionInfoStorage: this._sessionInfoStorage,
                    storageFactory: this._storageFactory,
                    createSessionContainer: this._createSessionContainer,
                    sessionCallback: this._sessionCallback,
                });
            });
            try {
                await this._sessionPickerViewModel.load();
            } catch (err) {
                this._setSection(() => this._error = err);
            }
        }

        _showLogin() {
            this._setSection(() => {
                this._loginViewModel = new LoginViewModel({
                    defaultHomeServer: "https://matrix.org",
                    createSessionContainer: this._createSessionContainer,
                    sessionCallback: this._sessionCallback,
                });
            });

        }

        get activeSection() {
            if (this._error) {
                return "error";
            } else if (this._sessionViewModel) {
                return "session";
            } else if (this._loginViewModel) {
                return "login";
            } else {
                return "picker";
            }
        }

        _setSection(setter) {
            // clear all members the activeSection depends on
            this._error = null;
            this._sessionViewModel = null;
            this._loginViewModel = null;
            this._sessionPickerViewModel = null;

            if (this._sessionContainer) {
                this._sessionContainer.stop();
                this._sessionContainer = null;
            }
            // now set it again
            setter();
            this.emitChange("activeSection");
        }

        get error() { return this._error; }
        get sessionViewModel() { return this._sessionViewModel; }
        get loginViewModel() { return this._loginViewModel; }
        get sessionPickerViewModel() { return this._sessionPickerViewModel; }
    }

    // DOM helper functions

    function isChildren(children) {
        // children should be an not-object (that's the attributes), or a domnode, or an array
        return typeof children !== "object" || !!children.nodeType || Array.isArray(children);
    }

    function classNames(obj, value) {
        return Object.entries(obj).reduce((cn, [name, enabled]) => {
            if (typeof enabled === "function") {
                enabled = enabled(value);
            }
            if (enabled) {
                return cn + (cn.length ? " " : "") + name;
            } else {
                return cn;
            }
        }, "");
    }

    function setAttribute(el, name, value) {
        if (name === "className") {
            name = "class";
        }
        if (value === false) {
            el.removeAttribute(name);
        } else {
            if (value === true) {
                value = name;
            }
            el.setAttribute(name, value);
        }
    }

    function elNS(ns, elementName, attributes, children) {
        if (attributes && isChildren(attributes)) {
            children = attributes;
            attributes = null;
        }

        const e = document.createElementNS(ns, elementName);

        if (attributes) {
            for (let [name, value] of Object.entries(attributes)) {
                if (name === "className" && typeof value === "object" && value !== null) {
                    value = classNames(value);
                }
                setAttribute(e, name, value);
            }
        }

        if (children) {
            if (!Array.isArray(children)) {
                children = [children];
            }
            for (let c of children) {
                if (!c.nodeType) {
                    c = text(c);
                }
                e.appendChild(c);
            }
        }
        return e;
    }

    function text(str) {
        return document.createTextNode(str);
    }

    const HTML_NS = "http://www.w3.org/1999/xhtml";
    const SVG_NS = "http://www.w3.org/2000/svg";

    const TAG_NAMES = {
        [HTML_NS]: [
            "a", "ol", "ul", "li", "div", "h1", "h2", "h3", "h4", "h5", "h6",
            "p", "strong", "em", "span", "img", "section", "main", "article", "aside",
            "pre", "button", "time", "input", "textarea"],
        [SVG_NS]: ["svg", "circle"]
    };

    const tag = {};


    for (const [ns, tags] of Object.entries(TAG_NAMES)) {
        for (const tagName of tags) {
            tag[tagName] = function(attributes, children) {
                return elNS(ns, tagName, attributes, children);
            };
        }
    }

    function insertAt(parentNode, idx, childNode) {
        const isLast = idx === parentNode.childElementCount;
        if (isLast) {
            parentNode.appendChild(childNode);
        } else {
            const nextDomNode = parentNode.children[idx];
            parentNode.insertBefore(childNode, nextDomNode);
        }
    }

    class ListView {
        constructor({list, onItemClick, className, parentProvidesUpdates = true}, childCreator) {
            this._onItemClick = onItemClick;
            this._list = list;
            this._className = className;
            this._root = null;
            this._subscription = null;
            this._childCreator = childCreator;
            this._childInstances = null;
            this._mountArgs = {parentProvidesUpdates};
            this._onClick = this._onClick.bind(this);
        }

        root() {
            return this._root;
        }

        update(attributes) {
            if (attributes.hasOwnProperty("list")) {
                if (this._subscription) {
                    this._unloadList();
                    while (this._root.lastChild) {
                        this._root.lastChild.remove();
                    }
                }
                this._list = attributes.list;
                this.loadList();
            }
        }

        mount() {
            const attr = {};
            if (this._className) {
                attr.className = this._className;
            }
            this._root = tag.ul(attr);
            this.loadList();
            if (this._onItemClick) {
                this._root.addEventListener("click", this._onClick);
            }
            return this._root;
        }

        unmount() {
            if (this._list) {
                this._unloadList();
            }
        }

        _onClick(event) {
            if (event.target === this._root) {
                return;
            }
            let childNode = event.target;
            while (childNode.parentNode !== this._root) {
                childNode = childNode.parentNode;
            }
            const index = Array.prototype.indexOf.call(this._root.childNodes, childNode);
            const childView = this._childInstances[index];
            this._onItemClick(childView, event);
        }

        _unloadList() {
            this._subscription = this._subscription();
            for (let child of this._childInstances) {
                child.unmount();
            }
            this._childInstances = null;
        }

        loadList() {
            if (!this._list) {
                return;
            }
            this._subscription = this._list.subscribe(this);
            this._childInstances = [];
            for (let item of this._list) {
                const child = this._childCreator(item);
                this._childInstances.push(child);
                const childDomNode = child.mount(this._mountArgs);
                this._root.appendChild(childDomNode);
            }
        }

        onAdd(idx, value) {
            this.onBeforeListChanged();
            const child = this._childCreator(value);
            this._childInstances.splice(idx, 0, child);
            insertAt(this._root, idx, child.mount(this._mountArgs));
            this.onListChanged();
        }

        onRemove(idx, _value) {
            this.onBeforeListChanged();
            const [child] = this._childInstances.splice(idx, 1);
            child.root().remove();
            child.unmount();
            this.onListChanged();
        }

        onMove(fromIdx, toIdx, value) {
            this.onBeforeListChanged();
            const [child] = this._childInstances.splice(fromIdx, 1);
            this._childInstances.splice(toIdx, 0, child);
            child.root().remove();
            insertAt(this._root, toIdx, child.root());
            this.onListChanged();
        }

        onUpdate(i, value, params) {
            if (this._childInstances) {
                const instance = this._childInstances[i];
                instance && instance.update(value, params);
            }
        }

        onBeforeListChanged() {}
        onListChanged() {}
    }

    function errorToDOM(error) {
        const stack = new Error().stack;
        const callee = stack.split("\n")[1];
        return tag.div([
            tag.h2("Something went wrong…"),
            tag.h3(error.message),
            tag.p(`This occurred while running ${callee}.`),
            tag.pre(error.stack),
        ]);
    }

    function objHasFns(obj) {
        for(const value of Object.values(obj)) {
            if (typeof value === "function") {
                return true;
            }
        }
        return false;
    }
    /**
        Bindable template. Renders once, and allows bindings for given nodes. If you need
        to change the structure on a condition, use a subtemplate (if)

        supports
            - event handlers (attribute fn value with name that starts with on)
            - one way binding of attributes (other attribute fn value)
            - one way binding of text values (child fn value)
            - refs to get dom nodes
            - className binding returning object with className => enabled map
            - add subviews inside the template
    */
    class TemplateView {
        constructor(value, render = undefined) {
            this._value = value;
            this._render = render;
            this._eventListeners = null;
            this._bindings = null;
            // this should become _subViews and also include templates.
            // How do we know which ones we should update though?
            // Wrapper class?
            this._subViews = null;
            this._root = null;
            this._boundUpdateFromValue = null;
        }

        get value() {
            return this._value;
        }

        _subscribe() {
            if (typeof this._value.on === "function") {
                this._boundUpdateFromValue = this._updateFromValue.bind(this);
                this._value.on("change", this._boundUpdateFromValue);
            }
        }

        _unsubscribe() {
            if (this._boundUpdateFromValue) {
                if (typeof this._value.off === "function") {
                    this._value.off("change", this._boundUpdateFromValue);
                }
                this._boundUpdateFromValue = null;
            }
        }

        _attach() {
            if (this._eventListeners) {
                for (let {node, name, fn} of this._eventListeners) {
                    node.addEventListener(name, fn);
                }
            }
        }

        _detach() {
            if (this._eventListeners) {
                for (let {node, name, fn} of this._eventListeners) {
                    node.removeEventListener(name, fn);
                }
            }
        }

        mount(options) {
            const builder = new TemplateBuilder(this);
            if (this._render) {
                this._root = this._render(builder, this._value);
            } else if (this.render) {   // overriden in subclass
                this._root = this.render(builder, this._value);
            } else {
                throw new Error("no render function passed in, or overriden in subclass");
            }
            const parentProvidesUpdates = options && options.parentProvidesUpdates;
            if (!parentProvidesUpdates) {
                this._subscribe();
            }
            this._attach();
            return this._root;
        }

        unmount() {
            this._detach();
            this._unsubscribe();
            if (this._subViews) {
                for (const v of this._subViews) {
                    v.unmount();
                }
            }
        }

        root() {
            return this._root;
        }

        _updateFromValue(changedProps) {
            this.update(this._value, changedProps);
        }

        update(value) {
            this._value = value;
            if (this._bindings) {
                for (const binding of this._bindings) {
                    binding();
                }
            }
        }

        _addEventListener(node, name, fn) {
            if (!this._eventListeners) {
                this._eventListeners = [];
            }
            this._eventListeners.push({node, name, fn});
        }

        _addBinding(bindingFn) {
            if (!this._bindings) {
                this._bindings = [];
            }
            this._bindings.push(bindingFn);
        }

        _addSubView(view) {
            if (!this._subViews) {
                this._subViews = [];
            }
            this._subViews.push(view);
        }
    }

    // what is passed to render
    class TemplateBuilder {
        constructor(templateView) {
            this._templateView = templateView;
        }

        get _value() {
            return this._templateView._value;
        }

        _addAttributeBinding(node, name, fn) {
            let prevValue = undefined;
            const binding = () => {
                const newValue = fn(this._value);
                if (prevValue !== newValue) {
                    prevValue = newValue;
                    setAttribute(node, name, newValue);
                }
            };
            this._templateView._addBinding(binding);
            binding();
        }

        _addClassNamesBinding(node, obj) {
            this._addAttributeBinding(node, "className", value => classNames(obj, value));
        }

        _addTextBinding(fn) {
            const initialValue = fn(this._value);
            const node = text(initialValue);
            let prevValue = initialValue;
            const binding = () => {
                const newValue = fn(this._value);
                if (prevValue !== newValue) {
                    prevValue = newValue;
                    node.textContent = newValue+"";
                }
            };

            this._templateView._addBinding(binding);
            return node;
        }

        _setNodeAttributes(node, attributes) {
            for(let [key, value] of Object.entries(attributes)) {
                const isFn = typeof value === "function";
                // binding for className as object of className => enabled
                if (key === "className" && typeof value === "object" && value !== null) {
                    if (objHasFns(value)) {
                        this._addClassNamesBinding(node, value);
                    } else {
                        setAttribute(node, key, classNames(value));
                    }
                } else if (key.startsWith("on") && key.length > 2 && isFn) {
                    const eventName = key.substr(2, 1).toLowerCase() + key.substr(3);
                    const handler = value;
                    this._templateView._addEventListener(node, eventName, handler);
                } else if (isFn) {
                    this._addAttributeBinding(node, key, value);
                } else {
                    setAttribute(node, key, value);
                }
            }
        }

        _setNodeChildren(node, children) {
            if (!Array.isArray(children)) {
                children = [children];
            }
            for (let child of children) {
                if (typeof child === "function") {
                    child = this._addTextBinding(child);
                } else if (!child.nodeType) {
                    // not a DOM node, turn into text
                    child = text(child);
                }
                node.appendChild(child);
            }
        }
        
        _addReplaceNodeBinding(fn, renderNode) {
            let prevValue = fn(this._value);
            let node = renderNode(null);

            const binding = () => {
                const newValue = fn(this._value);
                if (prevValue !== newValue) {
                    prevValue = newValue;
                    const newNode = renderNode(node);
                    if (node.parentElement) {
                        node.parentElement.replaceChild(newNode, node);
                    }
                    node = newNode;
                }
            };
            this._templateView._addBinding(binding);
            return node;
        }

        el(name, attributes, children) {
            return this.elNS(HTML_NS, name, attributes, children);
        }

        elNS(ns, name, attributes, children) {
            if (attributes && isChildren(attributes)) {
                children = attributes;
                attributes = null;
            }

            const node = document.createElementNS(ns, name);
            
            if (attributes) {
                this._setNodeAttributes(node, attributes);
            }
            if (children) {
                this._setNodeChildren(node, children);
            }

            return node;
        }

        // this insert a view, and is not a view factory for `if`, so returns the root element to insert in the template
        // you should not call t.view() and not use the result (e.g. attach the result to the template DOM tree).
        view(view) {
            let root;
            try {
                root = view.mount();
            } catch (err) {
                return errorToDOM(err);
            }
            this._templateView._addSubView(view);
            return root;
        }

        // sugar
        createTemplate(render) {
            return vm => new TemplateView(vm, render);
        }

        // map a value to a view, every time the value changes
        mapView(mapFn, viewCreator) {
            return this._addReplaceNodeBinding(mapFn, (prevNode) => {
                if (prevNode && prevNode.nodeType !== Node.COMMENT_NODE) {
                    const subViews = this._templateView._subViews;
                    const viewIdx = subViews.findIndex(v => v.root() === prevNode);
                    if (viewIdx !== -1) {
                        const [view] = subViews.splice(viewIdx, 1);
                        view.unmount();
                    }
                }
                const view = viewCreator(mapFn(this._value));
                if (view) {
                    return this.view(view);
                } else {
                    return document.createComment("node binding placeholder");
                }
            });
        }

        // creates a conditional subtemplate
        if(fn, viewCreator) {
            return this.mapView(
                value => !!fn(value),
                enabled => enabled ? viewCreator(this._value) : null
            );
        }
    }


    for (const [ns, tags] of Object.entries(TAG_NAMES)) {
        for (const tag of tags) {
            TemplateBuilder.prototype[tag] = function(attributes, children) {
                return this.elNS(ns, tag, attributes, children);
            };
        }
    }

    class RoomTile extends TemplateView {
        render(t) {
            return t.li([
                t.div({className: "avatar medium"}, vm => vm.avatarInitials),
                t.div({className: "description"}, t.div({className: "name"}, vm => vm.name))
            ]);
        }

        // called from ListView
        clicked() {
            this.value.open();
        }
    }

    class GapView extends TemplateView {
        render(t, vm) {
            const className = {
                GapView: true,
                isLoading: vm => vm.isLoading
            };
            const label = (vm.isUp ? "🠝" : "🠟") + " fill gap"; //no binding
            return t.li({className}, [
                t.button({
                    onClick: () => vm.fill(),
                    disabled: vm => vm.isLoading
                }, label),
                t.if(vm => vm.error, t.createTemplate(t => t.strong(vm => vm.error)))
            ]);
        }
    }

    class TextMessageView extends TemplateView {
        render(t, vm) {
            // no bindings ... should this be a template view?
            return t.li(
                {className: {"TextMessageView": true, own: vm.isOwn, pending: vm.isPending}},
                t.div({className: "message-container"}, [
                    t.div({className: "sender"}, vm => vm.isContinuation ? "" : vm.sender),
                    t.p([vm.text, t.time(vm.date + " " + vm.time)]),
                ])
            );
        }
    }

    class ImageView extends TemplateView {
        render(t, vm) {
            // replace with css aspect-ratio once supported
            const heightRatioPercent = (vm.thumbnailHeight / vm.thumbnailWidth) * 100;
            const image = t.img({
                src: vm.thumbnailUrl,
                width: vm.thumbnailWidth,
                height: vm.thumbnailHeight,
                loading: "lazy",
                alt: vm.label,
            });
            const linkContainer = t.a({
                href: vm.url,
                target: "_blank",
                style: `padding-top: ${heightRatioPercent}%; width: ${vm.thumbnailWidth}px;`
            }, image);

            return t.li(
                {className: {"TextMessageView": true, own: vm.isOwn, pending: vm.isPending}},
                t.div({className: "message-container"}, [
                    t.div({className: "sender"}, vm => vm.isContinuation ? "" : vm.sender),
                    t.div(linkContainer),
                    t.p(t.time(vm.date + " " + vm.time)),
                ])
            );
        }
    }

    class AnnouncementView extends TemplateView {
        render(t) {
            return t.li({className: "AnnouncementView"}, t.div(vm => vm.announcement));
        }
    }

    class TimelineList extends ListView {
        constructor(options = {}) {
            options.className = "Timeline";
            super(options, entry => {
                switch (entry.shape) {
                    case "gap": return new GapView(entry);
                    case "announcement": return new AnnouncementView(entry);
                    case "message": return new TextMessageView(entry);
                    case "image": return new ImageView(entry);
                }
            });
            this._atBottom = false;
            this._onScroll = this._onScroll.bind(this);
            this._topLoadingPromise = null;
            this._viewModel = null;
        }

        async _onScroll() {
            const root = this.root();
            if (root.scrollTop === 0 && !this._topLoadingPromise && this._viewModel) {
                const beforeFromBottom = this._distanceFromBottom();
                this._topLoadingPromise = this._viewModel.loadAtTop();
                await this._topLoadingPromise;
                const fromBottom = this._distanceFromBottom();
                const amountGrown = fromBottom - beforeFromBottom;
                root.scrollTop = root.scrollTop + amountGrown;
                this._topLoadingPromise = null;
            }
        }

        update(attributes) {
            if(attributes.viewModel) {
                this._viewModel = attributes.viewModel;
                attributes.list = attributes.viewModel.tiles;
            }
            super.update(attributes);
        }

        mount() {
            const root = super.mount();
            root.addEventListener("scroll", this._onScroll);
            return root;
        }

        unmount() {
            this.root().removeEventListener("scroll", this._onScroll);
            super.unmount();
        }

        loadList() {
            super.loadList();
            const root = this.root();
            root.scrollTop = root.scrollHeight;
        }

        onBeforeListChanged() {
            const fromBottom = this._distanceFromBottom();
            this._atBottom = fromBottom < 1;
        }

        _distanceFromBottom() {
            const root = this.root();
            return root.scrollHeight - root.scrollTop - root.clientHeight;
        }

        onListChanged() {
            if (this._atBottom) {
                const root = this.root();
                root.scrollTop = root.scrollHeight;
            }
        }
    }

    class MessageComposer extends TemplateView {
        constructor(viewModel) {
            super(viewModel);
            this._input = null;
        }

        render(t) {
            this._input = t.input({
                placeholder: "Send a message ...",
                onKeydown: e => this._onKeyDown(e)
            });
            return t.div({className: "MessageComposer"}, [this._input]);
        }

        _onKeyDown(event) {
            if (event.key === "Enter") {
                if (this.value.sendMessage(this._input.value)) {
                    this._input.value = "";
                }
            }
        }
    }

    class RoomView extends TemplateView {
        constructor(viewModel) {
            super(viewModel);
            this._timelineList = null;
        }

        render(t, vm) {
            this._timelineList = new TimelineList();
            return t.div({className: "RoomView"}, [
                t.div({className: "TimelinePanel"}, [
                    t.div({className: "RoomHeader"}, [
                        t.button({className: "back", onClick: () => vm.close()}),
                        t.div({className: "avatar large"}, vm => vm.avatarInitials),
                        t.div({className: "room-description"}, [
                            t.h2(vm => vm.name),
                        ]),
                    ]),
                    t.div({className: "RoomView_error"}, vm => vm.error),
                    t.view(this._timelineList),
                    t.view(new MessageComposer(this.value.composerViewModel)),
                ])
            ]);
        }

        update(value, prop) {
            super.update(value, prop);
            if (prop === "timelineViewModel") {
                this._timelineList.update({viewModel: this.value.timelineViewModel});
            }
        }
    }

    class SwitchView {
        constructor(defaultView) {
            this._childView = defaultView;
        }

        mount() {
            return this._childView.mount();
        }

        unmount() {
            return this._childView.unmount();
        }

        root() {
            return this._childView.root();
        }

        update() {
            return this._childView.update();
        }

        switch(newView) {
            const oldRoot = this.root();
            this._childView.unmount();
            this._childView = newView;
            let newRoot;
            try {
                newRoot = this._childView.mount();
            } catch (err) {
                newRoot = errorToDOM(err);
            }
            const parent = oldRoot.parentElement;
            if (parent) {
                parent.replaceChild(newRoot, oldRoot);
            }
        }

        get childView() {
            return this._childView;
        }
    }

    class RoomPlaceholderView {
        constructor() {
            this._root = null;
        }

        mount() {
            this._root = tag.div({className: "RoomPlaceholderView"}, tag.h2("Choose a room on the left side."));
            return this._root;
        }

        root() {
            return this._root;
        }

        unmount() {}
        update() {}
    }

    function spinner(t, extraClasses = undefined) {
        return t.svg({className: Object.assign({"spinner": true}, extraClasses), viewBox:"0 0 100 100"}, 
            t.circle({cx:"50%", cy:"50%", r:"45%", pathLength:"100"})
        );
    }

    class SessionStatusView extends TemplateView {
        render(t, vm) {
            return t.div({className: {
                "SessionStatusView": true,
                "hidden": vm => !vm.isShown,
            }}, [
                spinner(t, {hidden: vm => !vm.isWaiting}),
                t.p(vm => vm.statusLabel),
                t.if(vm => vm.isConnectNowShown, t.createTemplate(t => t.button({onClick: () => vm.connectNow()}, "Retry now"))),
                window.DEBUG ? t.button({id: "showlogs"}, "Show logs") : ""
            ]);
        }
    }

    class SessionView {
        constructor(viewModel) {
            this._viewModel = viewModel;
            this._middleSwitcher = null;
            this._roomList = null;
            this._currentRoom = null;
            this._root = null;
            this._onViewModelChange = this._onViewModelChange.bind(this);
        }

        root() {
            return this._root;
        }

        mount() {
            this._viewModel.on("change", this._onViewModelChange);
            this._sessionStatusBar = new SessionStatusView(this._viewModel.sessionStatusViewModel);
            this._roomList = new ListView(
                {
                    className: "RoomList",
                    list: this._viewModel.roomList,
                    onItemClick: (roomTile, event) => roomTile.clicked(event)
                },
                (room) => new RoomTile(room)
            );
            this._middleSwitcher = new SwitchView(new RoomPlaceholderView());

            this._root = tag.div({className: "SessionView"}, [
                this._sessionStatusBar.mount(),
                tag.div({className: "main"}, [
                    tag.div({className: "LeftPanel"}, this._roomList.mount()),
                    this._middleSwitcher.mount()
                ])
            ]);
            
            return this._root;
        }

        unmount() {
            this._roomList.unmount();
            this._middleSwitcher.unmount();
            this._viewModel.off("change", this._onViewModelChange);
        }

        _onViewModelChange(prop) {
            if (prop === "currentRoom") {
                if (this._viewModel.currentRoom) {
                    this._root.classList.add("room-shown");
                    this._middleSwitcher.switch(new RoomView(this._viewModel.currentRoom));
                } else {
                    this._root.classList.remove("room-shown");
                    this._middleSwitcher.switch(new RoomPlaceholderView());
                }
            }
        }

        // changing viewModel not supported for now
        update() {}
    }

    function brawlGithubLink(t) {
        if (window.BRAWL_VERSION) {
            return t.a({target: "_blank", href: `https://github.com/bwindels/brawl-chat/releases/tag/v${window.BRAWL_VERSION}`}, `Brawl v${window.BRAWL_VERSION} on Github`);
        } else {
            return t.a({target: "_blank", href: "https://github.com/bwindels/brawl-chat"}, "Brawl on Github");
        }
    }

    class SessionLoadView extends TemplateView {
        render(t) {
            return t.div({className: "SessionLoadView"}, [
                spinner(t, {hiddenWithLayout: vm => !vm.loading}),
                t.p(vm => vm.loadLabel)
            ]);
        }
    }

    class LoginView extends TemplateView {
        render(t, vm) {
            const disabled = vm => !!vm.isBusy;
            const username = t.input({type: "text", placeholder: vm.i18n`Username`, disabled});
            const password = t.input({type: "password", placeholder: vm.i18n`Password`, disabled});
            const homeserver = t.input({type: "text", placeholder: vm.i18n`Your matrix homeserver`, value: vm.defaultHomeServer, disabled});
            return t.div({className: "LoginView form"}, [
                t.h1([vm.i18n`Log in to your homeserver`]),
                t.if(vm => vm.error, t.createTemplate(t => t.div({className: "error"}, vm => vm.error))),
                t.div(username),
                t.div(password),
                t.div(homeserver),
                t.div(t.button({
                    onClick: () => vm.login(username.value, password.value, homeserver.value),
                    disabled
                }, vm.i18n`Log In`)),
                t.div(t.button({onClick: () => vm.cancel(), disabled}, [vm.i18n`Pick an existing session`])),
                t.mapView(vm => vm.loadViewModel, loadViewModel => loadViewModel ? new SessionLoadView(loadViewModel) : null),
                t.p(brawlGithubLink(t))
            ]);
        }
    }

    function selectFileAsText(mimeType) {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        if (mimeType) {
            input.setAttribute("accept", mimeType);
        }
        const promise = new Promise((resolve, reject) => {
            const checkFile = () => {
                input.removeEventListener("change", checkFile, true);
                const file = input.files[0];
                if (file) {
                    resolve(file.text());
                } else {
                    reject(new Error("No file selected"));
                }
            };
            input.addEventListener("change", checkFile, true);
        });
        input.click();
        return promise;
    }



    class SessionPickerItemView extends TemplateView {
        _onDeleteClick() {
            if (confirm("Are you sure?")) {
                this.value.delete();
            }
        }

        render(t, vm) {
            const deleteButton = t.button({
                disabled: vm => vm.isDeleting,
                onClick: this._onDeleteClick.bind(this),
            }, "Delete");
            const clearButton = t.button({
                disabled: vm => vm.isClearing,
                onClick: () => vm.clear(),
            }, "Clear");
            const exportButton = t.button({
                disabled: vm => vm.isClearing,
                onClick: () => vm.export(),
            }, "Export");
            const downloadExport = t.if(vm => vm.exportDataUrl, t.createTemplate((t, vm) => {
                return t.a({
                    href: vm.exportDataUrl,
                    download: `brawl-session-${vm.id}.json`,
                    onClick: () => setTimeout(() => vm.clearExport(), 100),
                }, "Download");
            }));

            const userName = t.span({className: "userId"}, vm => vm.label);
            const errorMessage = t.if(vm => vm.error, t.createTemplate(t => t.span({className: "error"}, vm => vm.error)));
            return t.li([t.div({className: "sessionInfo"}, [
                userName,
                errorMessage,
                downloadExport,
                exportButton,
                clearButton,
                deleteButton,
            ])]);
        }
    }

    class SessionPickerView extends TemplateView {
        render(t, vm) {
            const sessionList = new ListView({
                list: vm.sessions,
                onItemClick: (item, event) => {
                    if (event.target.closest(".userId")) {
                        vm.pick(item.value.id);
                    }
                },
                parentProvidesUpdates: false,
            }, sessionInfo => {
                return new SessionPickerItemView(sessionInfo);
            });

            return t.div({className: "SessionPickerView"}, [
                t.h1(["Pick a session"]),
                t.view(sessionList),
                t.p(t.button({onClick: () => vm.cancel()}, ["Log in to a new session instead"])),
                t.p(t.button({onClick: async () => vm.import(await selectFileAsText("application/json"))}, "Import")),
                t.if(vm => vm.loadViewModel, vm => new SessionLoadView(vm.loadViewModel)),
                t.p(brawlGithubLink(t))
            ]);
        }
    }

    class BrawlView {
        constructor(vm) {
            this._vm = vm;
            this._switcher = null;
            this._root = null;
            this._onViewModelChange = this._onViewModelChange.bind(this);
        }

        _getView() {
            switch (this._vm.activeSection) {
                case "error":
                    return new StatusView({header: "Something went wrong", message: this._vm.errorText});
                case "session":
                    return new SessionView(this._vm.sessionViewModel);
                case "login":
                    return new LoginView(this._vm.loginViewModel);
                case "picker":
                    return new SessionPickerView(this._vm.sessionPickerViewModel);
                default:
                    throw new Error(`Unknown section: ${this._vm.activeSection}`);
            }
        }

        _onViewModelChange(prop) {
            if (prop === "activeSection") {
                this._switcher.switch(this._getView());
            }
        }

        mount() {
            this._switcher = new SwitchView(this._getView());
            this._root = this._switcher.mount();
            this._vm.on("change", this._onViewModelChange);
            return this._root;
        }

        unmount() {
            this._vm.off("change", this._onViewModelChange);
            this._switcher.unmount();
        }

        root() {
            return this._root;
        }

        update() {}
    }

    class StatusView extends TemplateView {
        render(t, vm) {
            return t.div({className: "StatusView"}, [
                t.h1(vm.header),
                t.p(vm.message),
            ]);
        }
    }

    class Timeout {
        constructor(ms) {
            this._reject = null;
            this._handle = null;
            this._promise = new Promise((resolve, reject) => {
                this._reject = reject;
                this._handle = setTimeout(() => {
                    this._reject = null;
                    resolve();
                }, ms);
            });
        }

        elapsed() {
            return this._promise;
        }

        abort() {
            if (this._reject) {
                this._reject(new AbortError());
                clearTimeout(this._handle);
                this._handle = null;
                this._reject = null;
            }
        }

        dispose() {
            this.abort();
        }
    }

    class Interval {
        constructor(ms, callback) {
            this._handle = setInterval(callback, ms);
        }

        dispose() {
            if (this._handle) {
                clearInterval(this._handle);
                this._handle = null;
            }
        }
    }


    class TimeMeasure {
        constructor() {
            this._start = window.performance.now();
        }

        measure() {
            return window.performance.now() - this._start;
        }
    }

    class Clock {
        createMeasure() {
            return new TimeMeasure();
        }

        createTimeout(ms) {
            return new Timeout(ms);
        }

        createInterval(callback, ms) {
            return new Interval(ms, callback);
        }

        now() {
            return Date.now();
        }
    }

    class OnlineStatus extends BaseObservableValue {
        constructor() {
            super();
            this._onOffline = this._onOffline.bind(this);
            this._onOnline = this._onOnline.bind(this);
        }

        _onOffline() {
            this.emit(false);
        }

        _onOnline() {
            this.emit(true);
        }

        get value() {
            return navigator.onLine;
        }

        onSubscribeFirst() {
            window.addEventListener('offline', this._onOffline);
            window.addEventListener('online', this._onOnline);
        }

        onUnsubscribeLast() {
            window.removeEventListener('offline', this._onOffline);
            window.removeEventListener('online', this._onOnline);
        }
    }

    // import {RecordRequester, ReplayRequester} from "./matrix/net/request/replay.js";

    async function main(container) {
        try {
            // to replay:
            // const fetchLog = await (await fetch("/fetchlogs/constrainterror.json")).json();
            // const replay = new ReplayRequester(fetchLog, {delay: false});
            // const request = replay.request;

            // to record:
            // const recorder = new RecordRequester(fetchRequest);
            // const request = recorder.request;
            // window.getBrawlFetchLog = () => recorder.log();
            // normal network:
            const request = fetchRequest;
            const sessionInfoStorage = new SessionInfoStorage("brawl_sessions_v1");
            const clock = new Clock();
            const storageFactory = new StorageFactory();

            const vm = new BrawlViewModel({
                createSessionContainer: () => {
                    return new SessionContainer({
                        random: Math.random,
                        onlineStatus: new OnlineStatus(),
                        storageFactory,
                        sessionInfoStorage,
                        request,
                        clock,
                    });
                },
                sessionInfoStorage,
                storageFactory,
                clock,
            });
            window.__brawlViewModel = vm;
            await vm.load();
            const view = new BrawlView(vm);
            container.appendChild(view.mount());
        } catch(err) {
            console.error(`${err.message}:\n${err.stack}`);
        }
    }

    return main;

}());

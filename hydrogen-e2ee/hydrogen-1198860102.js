class AbortError extends Error {
    get name() {
        return "AbortError";
    }
}

class WrappedError extends Error {
    constructor(message, cause) {
        super(`${message}: ${cause.message}`);
        this.cause = cause;
    }
    get name() {
        return "WrappedError";
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

function abortOnTimeout(createTimeout, timeoutAmount, requestResult, responsePromise) {
    const timeout = createTimeout(timeoutAmount);
    let timedOut = false;
    timeout.elapsed().then(
        () => {
            timedOut = true;
            requestResult.abort();
        },
        () => {}
    );
    return responsePromise.then(
        response => {
            timeout.abort();
            return response;
        },
        err => {
            timeout.abort();
            if (err instanceof AbortError && timedOut) {
                throw new ConnectionError(`Request timed out after ${timeoutAmount}ms`, true);
            } else {
                throw err;
            }
        }
    );
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
            this.promise = Promise.race([promise, abortPromise]);
        } else {
            this.promise = promise;
            this._controller = controller;
        }
    }
    abort() {
        this._controller.abort();
    }
    response() {
        return this.promise;
    }
}
function createFetchRequest(createTimeout) {
    return function fetchRequest(url, options) {
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
                throw new ConnectionError(`${options.method} ${url}: ${err.message}`);
            }
            throw err;
        });
        const result = new RequestResult(promise, controller);
        if (options.timeout) {
            result.promise = abortOnTimeout(createTimeout, options.timeout, result, result.promise);
        }
        return result;
    }
}

class RequestResult$1 {
    constructor(promise, xhr) {
        this._promise = promise;
        this._xhr = xhr;
    }
    abort() {
        this._xhr.abort();
    }
    response() {
        return this._promise;
    }
}
function send(url, options) {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, url);
    if (options.headers) {
        for(const [name, value] of options.headers.entries()) {
            xhr.setRequestHeader(name, value);
        }
    }
    if (options.timeout) {
        xhr.timeout = options.timeout;
    }
    xhr.send(options.body || null);
    return xhr;
}
function xhrAsPromise(xhr, method, url) {
    return new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => resolve(xhr));
        xhr.addEventListener("abort", () => reject(new AbortError()));
        xhr.addEventListener("error", () => reject(new ConnectionError(`Error ${method} ${url}`)));
        xhr.addEventListener("timeout", () => reject(new ConnectionError(`Timeout ${method} ${url}`, true)));
    });
}
function addCacheBuster(urlStr, random = Math.random) {
    if (urlStr.includes("?")) {
        urlStr = urlStr + "&";
    } else {
        urlStr = urlStr + "?";
    }
    return urlStr + `_cacheBuster=${Math.ceil(random() * Number.MAX_SAFE_INTEGER)}`;
}
function xhrRequest(url, options) {
    url = addCacheBuster(url);
    const xhr = send(url, options);
    const promise = xhrAsPromise(xhr, options.method, url).then(xhr => {
        const {status} = xhr;
        let body = xhr.responseText;
        if (xhr.getResponseHeader("Content-Type") === "application/json") {
            body = JSON.parse(body);
        }
        return {status, body};
    });
    return new RequestResult$1(promise, xhr);
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
}

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
    constructor(method, url, requestResult) {
        this._requestResult = requestResult;
        this._promise = requestResult.response().then(response => {
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
function encodeQueryParams(queryParams) {
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
class HomeServerApi {
    constructor({homeServer, accessToken, request, createTimeout, reconnector}) {
        this._homeserver = homeServer;
        this._accessToken = accessToken;
        this._requestFn = request;
        this._createTimeout = createTimeout;
        this._reconnector = reconnector;
        this._mediaRepository = new MediaRepository(homeServer);
    }
    _url(csPath) {
        return `${this._homeserver}/_matrix/client/r0${csPath}`;
    }
    _request(method, url, queryParams, body, options) {
        const queryString = encodeQueryParams(queryParams);
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
            timeout: options && options.timeout
        });
        const wrapper = new RequestWrapper(method, url, requestResult);
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
    messages(roomId, params, options = null) {
        return this._get(`/rooms/${encodeURIComponent(roomId)}/messages`, params, null, options);
    }
    members(roomId, params, options = null) {
        return this._get(`/rooms/${encodeURIComponent(roomId)}/members`, params, null, options);
    }
    send(roomId, eventType, txnId, content, options = null) {
        return this._put(`/rooms/${encodeURIComponent(roomId)}/send/${encodeURIComponent(eventType)}/${encodeURIComponent(txnId)}`, {}, content, options);
    }
    receipt(roomId, receiptType, eventId, options = null) {
        return this._post(`/rooms/${encodeURIComponent(roomId)}/receipt/${encodeURIComponent(receiptType)}/${encodeURIComponent(eventId)}`,
            {}, {}, options);
    }
    passwordLogin(username, password, initialDeviceDisplayName, options = null) {
        return this._post("/login", null, {
          "type": "m.login.password",
          "identifier": {
            "type": "m.id.user",
            "user": username
          },
          "password": password,
          "initial_device_display_name": initialDeviceDisplayName
        }, options);
    }
    createFilter(userId, filter, options = null) {
        return this._post(`/user/${encodeURIComponent(userId)}/filter`, null, filter, options);
    }
    versions(options = null) {
        return this._request("GET", `${this._homeserver}/_matrix/client/versions`, null, null, options);
    }
    uploadKeys(payload, options = null) {
        return this._post("/keys/upload", null, payload, options);
    }
    queryKeys(queryRequest, options = null) {
        return this._post("/keys/query", null, queryRequest, options);
    }
    claimKeys(payload, options = null) {
        return this._post("/keys/claim", null, payload, options);
    }
    sendToDevice(type, payload, txnId, options = null) {
        return this._put(`/sendToDevice/${encodeURIComponent(type)}/${encodeURIComponent(txnId)}`, null, payload, options);
    }
    get mediaRepository() {
        return this._mediaRepository;
    }
}
class MediaRepository {
    constructor(homeserver) {
        this._homeserver = homeserver;
    }
    mxcUrlThumbnail(url, width, height, method) {
        const parts = this._parseMxcUrl(url);
        if (parts) {
            const [serverName, mediaId] = parts;
            const httpUrl = `${this._homeserver}/_matrix/media/r0/thumbnail/${encodeURIComponent(serverName)}/${encodeURIComponent(mediaId)}`;
            return httpUrl + "?" + encodeQueryParams({width, height, method});
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
    _parseMxcUrl(url) {
        const prefix = "mxc://";
        if (url.startsWith(prefix)) {
            return url.substr(prefix.length).split("/", 2);
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
        this._max = 60 * 5 * 1000;
        this._timeout = null;
    }
    async waitForRetry() {
        this._timeout = this._createTimeout(this._current);
        try {
            await this._timeout.elapsed();
            const next = 2 * this._current;
            this._current = Math.min(this._max, next);
        } catch(err) {
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
                console.error(err);
            } finally {
                if (onlineStatusSubscription) {
                    onlineStatusSubscription();
                }
                this._isReconnecting = false;
            }
        }
    }
    tryNow() {
        if (this._retryDelay) {
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
function timelineIsEmpty(roomResponse) {
    try {
        const events = roomResponse?.timeline?.events;
        return Array.isArray(events) && events.length === 0;
    } catch (err) {
        return true;
    }
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
    get error() {
        return this._error;
    }
    start() {
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
        let afterSyncCompletedPromise = Promise.resolve();
        while(this._status.get() !== SyncStatus.Stopped) {
            let roomStates;
            try {
                console.log(`starting sync request with since ${syncToken} ...`);
                const timeout = syncToken ? INCREMENTAL_TIMEOUT : undefined;
                const syncResult = await this._syncRequest(syncToken, timeout, afterSyncCompletedPromise);
                syncToken = syncResult.syncToken;
                roomStates = syncResult.roomStates;
                this._status.set(SyncStatus.Syncing);
            } catch (err) {
                if (!(err instanceof AbortError)) {
                    this._error = err;
                    this._status.set(SyncStatus.Stopped);
                }
            }
            if (!this._error) {
                afterSyncCompletedPromise = this._runAfterSyncCompleted(roomStates);
            }
        }
    }
    async _runAfterSyncCompleted(roomStates) {
        const sessionPromise = (async () => {
            try {
                await this._session.afterSyncCompleted();
            } catch (err) {
                console.error("error during session afterSyncCompleted, continuing",  err.stack);
            }
        })();
        const roomsNeedingAfterSyncCompleted = roomStates.filter(rs => {
            return rs.room.needsAfterSyncCompleted(rs.changes);
        });
        const roomsPromises = roomsNeedingAfterSyncCompleted.map(async rs => {
            try {
                await rs.room.afterSyncCompleted(rs.changes);
            } catch (err) {
                console.error(`error during room ${rs.room.id} afterSyncCompleted, continuing`,  err.stack);
            }
        });
        await Promise.all(roomsPromises.concat(sessionPromise));
    }
    async _syncRequest(syncToken, timeout, prevAfterSyncCompletedPromise) {
        let {syncFilterId} = this._session;
        if (typeof syncFilterId !== "string") {
            this._currentRequest = this._hsApi.createFilter(this._session.user.id, {room: {state: {lazy_load_members: true}}});
            syncFilterId = (await this._currentRequest.response()).filter_id;
        }
        const totalRequestTimeout = timeout + (80 * 1000);
        this._currentRequest = this._hsApi.sync(syncToken, syncFilterId, timeout, {timeout: totalRequestTimeout});
        const response = await this._currentRequest.response();
        await prevAfterSyncCompletedPromise;
        const isInitialSync = !syncToken;
        syncToken = response.next_batch;
        const roomStates = this._parseRoomsResponse(response.rooms, isInitialSync);
        await this._prepareRooms(roomStates);
        let sessionChanges;
        const syncTxn = await this._openSyncTxn();
        try {
            await Promise.all(roomStates.map(async rs => {
                console.log(` * applying sync response to room ${rs.room.id} ...`);
                rs.changes = await rs.room.writeSync(
                    rs.roomResponse, rs.membership, isInitialSync, rs.preparation, syncTxn);
            }));
            sessionChanges = await this._session.writeSync(response, syncFilterId, syncTxn);
        } catch(err) {
            console.warn("aborting syncTxn because of error");
            console.error(err);
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
        for(let rs of roomStates) {
            rs.room.afterSync(rs.changes);
        }
        return {syncToken, roomStates};
    }
    async _openPrepareSyncTxn() {
        const storeNames = this._storage.storeNames;
        return await this._storage.readTxn([
            storeNames.inboundGroupSessions,
        ]);
    }
    async _prepareRooms(roomStates) {
        const prepareRoomStates = roomStates.filter(rs => rs.room.needsPrepareSync);
        if (prepareRoomStates.length) {
            const prepareTxn = await this._openPrepareSyncTxn();
            await Promise.all(prepareRoomStates.map(async rs => {
                rs.preparation = await rs.room.prepareSync(rs.roomResponse, prepareTxn);
            }));
            await Promise.all(prepareRoomStates.map(async rs => {
                rs.preparation = await rs.room.afterPrepareSync(rs.preparation);
            }));
        }
    }
    async _openSyncTxn() {
        const storeNames = this._storage.storeNames;
        return await this._storage.readWriteTxn([
            storeNames.session,
            storeNames.roomSummary,
            storeNames.roomState,
            storeNames.roomMembers,
            storeNames.timelineEvents,
            storeNames.timelineFragments,
            storeNames.pendingEvents,
            storeNames.userIdentities,
            storeNames.groupSessionDecryptions,
            storeNames.deviceIdentities,
            storeNames.outboundGroupSessions
        ]);
    }
    _parseRoomsResponse(roomsSection, isInitialSync) {
        const roomStates = [];
        if (roomsSection) {
            const allMemberships = ["join"];
            for(const membership of allMemberships) {
                const membershipSection = roomsSection[membership];
                if (membershipSection) {
                    for (const [roomId, roomResponse] of Object.entries(membershipSection)) {
                        if (isInitialSync && timelineIsEmpty(roomResponse)) {
                            return;
                        }
                        let room = this._session.rooms.get(roomId);
                        if (!room) {
                            room = this._session.createRoom(roomId);
                        }
                        roomStates.push(new RoomSyncProcessState(room, roomResponse, membership));
                    }
                }
            }
        }
        return roomStates;
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
class RoomSyncProcessState {
    constructor(room, roomResponse, membership) {
        this.room = room;
        this.roomResponse = roomResponse;
        this.membership = membership;
        this.preparation = null;
        this.changes = null;
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

var escaped = /[\\\"\x00-\x1F]/g;
var escapes = {};
for (var i = 0; i < 0x20; ++i) {
    escapes[String.fromCharCode(i)] = (
        '\\U' + ('0000' + i.toString(16)).slice(-4).toUpperCase()
    );
}
escapes['\b'] = '\\b';
escapes['\t'] = '\\t';
escapes['\n'] = '\\n';
escapes['\f'] = '\\f';
escapes['\r'] = '\\r';
escapes['\"'] = '\\\"';
escapes['\\'] = '\\\\';
function escapeString(value) {
    escaped.lastIndex = 0;
    return value.replace(escaped, function(c) { return escapes[c]; });
}
function stringify(value) {
    switch (typeof value) {
        case 'string':
            return '"' + escapeString(value) + '"';
        case 'number':
            return isFinite(value) ? value : 'null';
        case 'boolean':
            return value;
        case 'object':
            if (value === null) {
                return 'null';
            }
            if (Array.isArray(value)) {
                return stringifyArray(value);
            }
            return stringifyObject(value);
        default:
            throw new Error('Cannot stringify: ' + typeof value);
    }
}
function stringifyArray(array) {
    var sep = '[';
    var result = '';
    for (var i = 0; i < array.length; ++i) {
        result += sep;
        sep = ',';
        result += stringify(array[i]);
    }
    if (sep != ',') {
        return '[]';
    } else {
        return result + ']';
    }
}
function stringifyObject(object) {
    var sep = '{';
    var result = '';
    var keys = Object.keys(object);
    keys.sort();
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        result += sep + '"' + escapeString(key) + '":';
        sep = ',';
        result += stringify(object[key]);
    }
    if (sep != ',') {
        return '{}';
    } else {
        return result + '}';
    }
}
var anotherJson = {stringify: stringify};

const DecryptionSource = createEnum(["Sync", "Timeline", "Retry"]);
const SESSION_KEY_PREFIX = "e2ee:";
const OLM_ALGORITHM = "m.olm.v1.curve25519-aes-sha2";
const MEGOLM_ALGORITHM = "m.megolm.v1.aes-sha2";
class DecryptionError extends Error {
    constructor(code, event, detailsObj = null) {
        super(`Decryption error ${code}${detailsObj ? ": "+JSON.stringify(detailsObj) : ""}`);
        this.code = code;
        this.event = event;
        this.details = detailsObj;
    }
}
const SIGNATURE_ALGORITHM = "ed25519";
function verifyEd25519Signature(olmUtil, userId, deviceOrKeyId, ed25519Key, value) {
    const clone = Object.assign({}, value);
    delete clone.unsigned;
    delete clone.signatures;
    const canonicalJson = anotherJson.stringify(clone);
    const signature = value?.signatures?.[userId]?.[`${SIGNATURE_ALGORITHM}:${deviceOrKeyId}`];
    try {
        if (!signature) {
            throw new Error("no signature");
        }
        olmUtil.ed25519_verify(ed25519Key, canonicalJson, signature);
        return true;
    } catch (err) {
        console.warn("Invalid signature, ignoring.", ed25519Key, canonicalJson, signature, err);
        return false;
    }
}

function applySyncResponse(data, roomResponse, membership, isInitialSync, isTimelineOpen, ownUserId) {
    if (roomResponse.summary) {
        data = updateSummary(data, roomResponse.summary);
    }
    if (membership !== data.membership) {
        data = data.cloneIfNeeded();
        data.membership = membership;
    }
    if (roomResponse.account_data) {
        data = roomResponse.account_data.events.reduce(processRoomAccountData, data);
    }
    if (roomResponse.state) {
        data = roomResponse.state.events.reduce(processStateEvent, data);
    }
    const {timeline} = roomResponse;
    if (timeline && Array.isArray(timeline.events)) {
        data = timeline.events.reduce((data, event) => {
            if (typeof event.state_key === "string") {
                return processStateEvent(data, event);
            } else {
                return processTimelineEvent(data, event,
                    isInitialSync, isTimelineOpen, ownUserId);
            }
        }, data);
    }
    const unreadNotifications = roomResponse.unread_notifications;
    if (unreadNotifications) {
        data = data.cloneIfNeeded();
        data.highlightCount = unreadNotifications.highlight_count || 0;
        data.notificationCount = unreadNotifications.notification_count;
    }
    return data;
}
function processRoomAccountData(data, event) {
    if (event?.type === "m.tag") {
        let tags = event?.content?.tags;
        if (!tags || Array.isArray(tags) || typeof tags !== "object") {
            tags = null;
        }
        data = data.cloneIfNeeded();
        data.tags = tags;
    }
    return data;
}
function processStateEvent(data, event) {
    if (event.type === "m.room.encryption") {
        const algorithm = event.content?.algorithm;
        if (!data.encryption && algorithm === MEGOLM_ALGORITHM) {
            data = data.cloneIfNeeded();
            data.encryption = event.content;
        }
    } else if (event.type === "m.room.name") {
        const newName = event.content?.name;
        if (newName !== data.name) {
            data = data.cloneIfNeeded();
            data.name = newName;
        }
    } else if (event.type === "m.room.avatar") {
        const newUrl = event.content?.url;
        if (newUrl !== data.avatarUrl) {
            data = data.cloneIfNeeded();
            data.avatarUrl = newUrl;
        }
    } else if (event.type === "m.room.canonical_alias") {
        const content = event.content;
        data = data.cloneIfNeeded();
        data.canonicalAlias = content.alias;
    }
    return data;
}
function processTimelineEvent(data, event, isInitialSync, isTimelineOpen, ownUserId) {
    if (event.type === "m.room.message") {
        data = data.cloneIfNeeded();
        data.lastMessageTimestamp = event.origin_server_ts;
        if (!isInitialSync && event.sender !== ownUserId && !isTimelineOpen) {
            data.isUnread = true;
        }
        const {content} = event;
        const body = content?.body;
        const msgtype = content?.msgtype;
        if (msgtype === "m.text") {
            data.lastMessageBody = body;
        }
    }
    return data;
}
function updateSummary(data, summary) {
    const heroes = summary["m.heroes"];
    const joinCount = summary["m.joined_member_count"];
    const inviteCount = summary["m.invited_member_count"];
    if (heroes && Array.isArray(heroes)) {
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
        this.lastMessageTimestamp = copy ? copy.lastMessageTimestamp : null;
        this.isUnread = copy ? copy.isUnread : false;
        this.encryption = copy ? copy.encryption : null;
        this.isDirectMessage = copy ? copy.isDirectMessage : false;
        this.membership = copy ? copy.membership : null;
        this.inviteCount = copy ? copy.inviteCount : 0;
        this.joinCount = copy ? copy.joinCount : 0;
        this.heroes = copy ? copy.heroes : null;
        this.canonicalAlias = copy ? copy.canonicalAlias : null;
        this.hasFetchedMembers = copy ? copy.hasFetchedMembers : false;
        this.isTrackingMembers = copy ? copy.isTrackingMembers : false;
        this.avatarUrl = copy ? copy.avatarUrl : null;
        this.notificationCount = copy ? copy.notificationCount : 0;
        this.highlightCount = copy ? copy.highlightCount : 0;
        this.tags = copy ? copy.tags : null;
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
function needsHeroes(data) {
    return !data.name && !data.canonicalAlias && data.heroes && data.heroes.length > 0;
}
class RoomSummary {
	constructor(roomId, ownUserId) {
        this._ownUserId = ownUserId;
        this._data = new SummaryData(null, roomId);
	}
	get name() {
		if (this._data.name) {
            return this._data.name;
        }
        if (this._data.canonicalAlias) {
            return this._data.canonicalAlias;
        }
        return null;
	}
    get heroes() {
        return this._data.heroes;
    }
    get encryption() {
        return this._data.encryption;
    }
    get needsHeroes() {
        return needsHeroes(this._data);
    }
    get isUnread() {
        return this._data.isUnread;
    }
    get notificationCount() {
        return this._data.notificationCount;
    }
    get highlightCount() {
        return this._data.highlightCount;
    }
	get lastMessage() {
		return this._data.lastMessageBody;
	}
    get lastMessageTimestamp() {
        return this._data.lastMessageTimestamp;
    }
	get inviteCount() {
		return this._data.inviteCount;
	}
	get joinCount() {
		return this._data.joinCount;
	}
    get avatarUrl() {
        return this._data.avatarUrl;
    }
    get hasFetchedMembers() {
        return this._data.hasFetchedMembers;
    }
    get isTrackingMembers() {
        return this._data.isTrackingMembers;
    }
    get tags() {
        return this._data.tags;
    }
    writeClearUnread(txn) {
        const data = new SummaryData(this._data);
        data.isUnread = false;
        data.notificationCount = 0;
        data.highlightCount = 0;
        txn.roomSummary.set(data.serialize());
        return data;
    }
    writeHasFetchedMembers(value, txn) {
        const data = new SummaryData(this._data);
        data.hasFetchedMembers = value;
        txn.roomSummary.set(data.serialize());
        return data;
    }
    writeIsTrackingMembers(value, txn) {
        const data = new SummaryData(this._data);
        data.isTrackingMembers = value;
        txn.roomSummary.set(data.serialize());
        return data;
    }
	writeSync(roomResponse, membership, isInitialSync, isTimelineOpen, txn) {
        this._data.cloned = false;
		const data = applySyncResponse(
            this._data, roomResponse,
            membership,
            isInitialSync, isTimelineOpen,
            this._ownUserId);
		if (data !== this._data) {
            txn.roomSummary.set(data.serialize());
            return data;
		}
	}
    applyChanges(data) {
        this._data = data;
    }
	async load(summary) {
        this._data = new SummaryData(summary);
	}
}

const WebPlatform = {
    get minStorageKey() {
        return 0;
    },
    get middleStorageKey() {
        return 0x7FFFFFFF;
    },
    get maxStorageKey() {
        return 0xFFFFFFFF;
    },
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

class EventKey {
    constructor(fragmentId, eventIndex) {
        this.fragmentId = fragmentId;
        this.eventIndex = eventIndex;
    }
    nextFragmentKey() {
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
            return this._fragmentIdComparer.compare(this.fragmentId, otherEntry.fragmentId);
        }
    }
    asEventKey() {
        return new EventKey(this.fragmentId, this.entryIndex);
    }
}

function getPrevContentFromStateEvent(event) {
    return event.unsigned?.prev_content || event.prev_content;
}

class EventEntry extends BaseEntry {
    constructor(eventEntry, fragmentIdComparer) {
        super(fragmentIdComparer);
        this._eventEntry = eventEntry;
        this._decryptionError = null;
        this._decryptionResult = null;
    }
    get event() {
        return this._eventEntry.event;
    }
    get fragmentId() {
        return this._eventEntry.fragmentId;
    }
    get entryIndex() {
        return this._eventEntry.eventIndex;
    }
    get content() {
        return this._decryptionResult?.event?.content || this._eventEntry.event.content;
    }
    get prevContent() {
        return getPrevContentFromStateEvent(this._eventEntry.event);
    }
    get eventType() {
        return this._decryptionResult?.event?.type || this._eventEntry.event.type;
    }
    get stateKey() {
        return this._eventEntry.event.state_key;
    }
    get sender() {
        return this._eventEntry.event.sender;
    }
    get displayName() {
        return this._eventEntry.displayName;
    }
    get avatarUrl() {
        return this._eventEntry.avatarUrl;
    }
    get timestamp() {
        return this._eventEntry.event.origin_server_ts;
    }
    get id() {
        return this._eventEntry.event.event_id;
    }
    setDecryptionResult(result) {
        this._decryptionResult = result;
    }
    get isEncrypted() {
        return this._eventEntry.event.type === "m.room.encrypted";
    }
    get isVerified() {
        return this.isEncrypted && this._decryptionResult?.isVerified;
    }
    get isUnverified() {
        return this.isEncrypted && this._decryptionResult?.isUnverified;
    }
    setDecryptionError(err) {
        this._decryptionError = err;
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
        return !!this.token && !this.edgeReached;
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
    get edgeReached() {
        if (this.started) {
            return this.fragment.startReached;
        } else {
            return this.fragment.endReached;
        }
    }
    set edgeReached(reached) {
        if (this.started) {
            this.fragment.startReached = reached;
        } else {
            this.fragment.endReached = reached;
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

const EVENT_TYPE = "m.room.member";
class RoomMember {
    constructor(data) {
        this._data = data;
    }
    static fromMemberEvent(roomId, memberEvent) {
        const userId = memberEvent && memberEvent.state_key;
        if (typeof userId !== "string") {
            return;
        }
        const content = memberEvent.content;
        const prevContent = getPrevContentFromStateEvent(memberEvent);
        const membership = content?.membership;
        const displayName = content?.displayname || prevContent?.displayname;
        const avatarUrl = content?.avatar_url || prevContent?.avatar_url;
        return this._validateAndCreateMember(roomId, userId, membership, displayName, avatarUrl);
    }
    static fromReplacingMemberEvent(roomId, memberEvent) {
        const userId = memberEvent && memberEvent.state_key;
        if (typeof userId !== "string") {
            return;
        }
        const content = getPrevContentFromStateEvent(memberEvent);
        return this._validateAndCreateMember(roomId, userId,
            content?.membership,
            content?.displayname,
            content?.avatar_url
        );
    }
    static _validateAndCreateMember(roomId, userId, membership, displayName, avatarUrl) {
        if (typeof membership !== "string") {
            return;
        }
        return new RoomMember({
            roomId,
            userId,
            membership,
            avatarUrl,
            displayName,
        });
    }
    get needsRoomKey() {
        return this._data.needsRoomKey;
    }
    set needsRoomKey(value) {
        this._data.needsRoomKey = !!value;
    }
    get membership() {
        return this._data.membership;
    }
    get displayName() {
        return this._data.displayName;
    }
    get name() {
        return this._data.displayName || this._data.userId;
    }
    get avatarUrl() {
        return this._data.avatarUrl;
    }
    get roomId() {
        return this._data.roomId;
    }
    get userId() {
        return this._data.userId;
    }
    serialize() {
        return this._data;
    }
}
class MemberChange {
    constructor(roomId, memberEvent) {
        this._roomId = roomId;
        this._memberEvent = memberEvent;
        this._member = null;
    }
    get member() {
        if (!this._member) {
            this._member = RoomMember.fromMemberEvent(this._roomId, this._memberEvent);
        }
        return this._member;
    }
    get roomId() {
        return this._roomId;
    }
    get userId() {
        return this._memberEvent.state_key;
    }
    get previousMembership() {
        return getPrevContentFromStateEvent(this._memberEvent)?.membership;
    }
    get membership() {
        return this._memberEvent.content?.membership;
    }
    get hasLeft() {
        return this.previousMembership === "join" && this.membership !== "join";
    }
    get hasJoined() {
        return this.previousMembership !== "join" && this.membership === "join";
    }
}

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
            this._lastLiveKey = new EventKey(liveFragment.id, lastEvent.eventIndex);
        }
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
    async _writeMember(event, trackNewlyJoined, txn) {
        const userId = event.state_key;
        if (userId) {
            const memberChange = new MemberChange(this._roomId, event);
            const {member} = memberChange;
            if (member) {
                if (trackNewlyJoined) {
                    const existingMemberData = await txn.roomMembers.get(this._roomId, userId);
                    member.needsRoomKey = existingMemberData?.needsRoomKey || memberChange.hasJoined;
                }
                txn.roomMembers.set(member.serialize());
                return memberChange;
            }
        }
    }
    async _writeStateEvent(event, trackNewlyJoined, txn) {
        if (event.type === EVENT_TYPE) {
            return await this._writeMember(event, trackNewlyJoined, txn);
        } else {
            txn.roomState.set(this._roomId, event);
        }
    }
    async _writeStateEvents(roomResponse, trackNewlyJoined, txn) {
        const memberChanges = new Map();
        const {state} = roomResponse;
        if (Array.isArray(state?.events)) {
            await Promise.all(state.events.map(async event => {
                const memberChange = await this._writeStateEvent(event, trackNewlyJoined, txn);
                if (memberChange) {
                    memberChanges.set(memberChange.userId, memberChange);
                }
            }));
        }
        return memberChanges;
    }
    async _writeTimeline(entries, timeline, currentKey, trackNewlyJoined, txn) {
        const memberChanges = new Map();
        if (Array.isArray(timeline.events)) {
            const events = deduplicateEvents(timeline.events);
            for(const event of events) {
                currentKey = currentKey.nextKey();
                const entry = createEventEntry(currentKey, this._roomId, event);
                let memberData = await this._findMemberData(event.sender, events, txn);
                if (memberData) {
                    entry.displayName = memberData.displayName;
                    entry.avatarUrl = memberData.avatarUrl;
                }
                txn.timelineEvents.insert(entry);
                entries.push(new EventEntry(entry, this._fragmentIdComparer));
            }
            await Promise.all(events.filter(event => {
                return typeof event.state_key === "string";
            }).map(async stateEvent => {
                const memberChange = await this._writeStateEvent(stateEvent, trackNewlyJoined, txn);
                if (memberChange) {
                    memberChanges.set(memberChange.userId, memberChange);
                }
            }));
        }
        return {currentKey, memberChanges};
    }
    async _findMemberData(userId, events, txn) {
        const memberData = await txn.roomMembers.get(this._roomId, userId);
        if (memberData) {
            return memberData;
        } else {
            const memberEvent = events.find(e => {
                return e.type === EVENT_TYPE && e.state_key === userId;
            });
            if (memberEvent) {
                return RoomMember.fromMemberEvent(this._roomId, memberEvent)?.serialize();
            }
        }
    }
    async writeSync(roomResponse, trackNewlyJoined, txn) {
        const entries = [];
        const {timeline} = roomResponse;
        let currentKey = this._lastLiveKey;
        if (!currentKey) {
            let liveFragment = await this._createLiveFragment(txn, timeline.prev_batch);
            currentKey = new EventKey(liveFragment.id, EventKey.defaultLiveKey.eventIndex);
            entries.push(FragmentBoundaryEntry.start(liveFragment, this._fragmentIdComparer));
        } else if (timeline.limited) {
            const oldFragmentId = currentKey.fragmentId;
            currentKey = currentKey.nextFragmentKey();
            const {oldFragment, newFragment} = await this._replaceLiveFragment(oldFragmentId, currentKey.fragmentId, timeline.prev_batch, txn);
            entries.push(FragmentBoundaryEntry.end(oldFragment, this._fragmentIdComparer));
            entries.push(FragmentBoundaryEntry.start(newFragment, this._fragmentIdComparer));
        }
        const memberChanges = await this._writeStateEvents(roomResponse, trackNewlyJoined, txn);
        const timelineResult = await this._writeTimeline(entries, timeline, currentKey, trackNewlyJoined, txn);
        currentKey = timelineResult.currentKey;
        for (const [userId, memberChange] of timelineResult.memberChanges.entries()) {
            memberChanges.set(userId, memberChange);
        }
        return {entries, newLiveKey: currentKey, memberChanges};
    }
    afterSync(newLiveKey) {
        this._lastLiveKey = newLiveKey;
    }
    get lastMessageKey() {
        return this._lastLiveKey;
    }
}

class GapWriter {
    constructor({roomId, storage, fragmentIdComparer}) {
        this._roomId = roomId;
        this._storage = storage;
        this._fragmentIdComparer = fragmentIdComparer;
    }
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
                if (duplicateEventIndex === -1) {
                    throw new Error(`findFirstOccurringEventId returned ${duplicateEventIndex} which wasn't ` +
                        `in [${eventIds.join(",")}] in ${this._roomId}`);
                }
                nonOverlappingEvents.push(...remainingEvents.slice(0, duplicateEventIndex));
                if (!expectedOverlappingEventId || duplicateEventId === expectedOverlappingEventId) {
                    const neighbourEvent = await txn.timelineEvents.getByEventId(this._roomId, duplicateEventId);
                    const neighbourFragment = await txn.timelineFragments.get(this._roomId, neighbourEvent.fragmentId);
                    neighbourFragmentEntry = fragmentEntry.createNeighbourEntry(neighbourFragment);
                    remainingEvents = null;
                } else {
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
    _storeEvents(events, startKey, direction, state, txn) {
        const entries = [];
        let key = startKey;
        for (let i = 0; i < events.length; ++i) {
            const event = events[i];
            key = key.nextKeyForDirection(direction);
            const eventStorageEntry = createEventEntry(key, this._roomId, event);
            const memberData = this._findMemberData(event.sender, state, events, i, direction);
            if (memberData) {
                eventStorageEntry.displayName = memberData?.displayName;
                eventStorageEntry.avatarUrl = memberData?.avatarUrl;
            }
            txn.timelineEvents.insert(eventStorageEntry);
            const eventEntry = new EventEntry(eventStorageEntry, this._fragmentIdComparer);
            directionalAppend(entries, eventEntry, direction);
        }
        return entries;
    }
    _findMemberData(userId, state, events, index, direction) {
        function isOurUser(event) {
            return event.type === EVENT_TYPE && event.state_key === userId;
        }
        const inc = direction.isBackward ? 1 : -1;
        for (let i = index + inc; i >= 0 && i < events.length; i += inc) {
            const event = events[i];
            if (isOurUser(event)) {
                return RoomMember.fromMemberEvent(this._roomId, event)?.serialize();
            }
        }
        for (let i = index; i >= 0 && i < events.length; i -= inc) {
            const event = events[i];
            if (isOurUser(event)) {
                return RoomMember.fromReplacingMemberEvent(this._roomId, event)?.serialize();
            }
        }
        const stateMemberEvent = state?.find(isOurUser);
        if (stateMemberEvent) {
            return RoomMember.fromMemberEvent(this._roomId, stateMemberEvent)?.serialize();
        }
    }
    async _updateFragments(fragmentEntry, neighbourFragmentEntry, end, entries, txn) {
        const {direction} = fragmentEntry;
        const changedFragments = [];
        directionalAppend(entries, fragmentEntry, direction);
        if (neighbourFragmentEntry) {
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
            neighbourFragmentEntry.token = null;
            fragmentEntry.token = null;
            txn.timelineFragments.update(neighbourFragmentEntry.fragment);
            directionalAppend(entries, neighbourFragmentEntry, direction);
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
        const {chunk, start, end, state} = response;
        let entries;
        if (!Array.isArray(chunk)) {
            throw new Error("Invalid chunk in response");
        }
        if (typeof end !== "string") {
            throw new Error("Invalid end token in response");
        }
        const fragment = await txn.timelineFragments.get(this._roomId, fragmentId);
        if (!fragment) {
            throw new Error(`Unknown fragment: ${fragmentId}`);
        }
        fragmentEntry = fragmentEntry.withUpdatedFragment(fragment);
        if (fragmentEntry.token !== start) {
            throw new Error("start is not equal to prev_batch or next_batch");
        }
        if (chunk.length === 0) {
            fragmentEntry.edgeReached = true;
            await txn.timelineFragments.update(fragmentEntry.fragment);
            return {entries: [fragmentEntry], fragments: []};
        }
        let lastKey = await this._findFragmentEdgeEventKey(fragmentEntry, txn);
        const {
            nonOverlappingEvents,
            neighbourFragmentEntry
        } = await this._findOverlappingEvents(fragmentEntry, chunk, txn);
        entries = this._storeEvents(nonOverlappingEvents, lastKey, direction, state, txn);
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
            this._values.set(key, value);
            this.emitUpdate(key, value, params);
            return true;
        }
        return false;
    }
    add(key, value) {
        if (!this._values.has(key)) {
            this._values.set(key, value);
            this.emitAdd(key, value);
            return true;
        }
        return false;
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
    values() {
        return this._values.values();
    }
}

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
        this._sortedPairs.splice(idx, 1);
        this.emitRemove(idx, value);
    }
    onUpdate(key, value, params) {
        const oldIdx = this._sortedPairs.findIndex(p => p.key === key);
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

class MappedMap extends BaseObservableMap {
    constructor(source, mapper) {
        super();
        this._source = source;
        this._mapper = mapper;
        this._mappedValues = new Map();
    }
    _emitSpontaneousUpdate(key, params) {
        const value = this._mappedValues.get(key);
        if (value) {
            this.emitUpdate(key, value, params);
        }
    }
    onAdd(key, value) {
        const emitSpontaneousUpdate = this._emitSpontaneousUpdate.bind(this, key);
        const mappedValue = this._mapper(value, emitSpontaneousUpdate);
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
            this.emitUpdate(key, mappedValue, params);
        }
    }
    onSubscribeFirst() {
        this._subscription = this._source.subscribe(this);
        for (let [key, value] of this._source) {
            const emitSpontaneousUpdate = this._emitSpontaneousUpdate.bind(this, key);
            const mappedValue = this._mapper(value, emitSpontaneousUpdate);
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
    get size() {
        return this._mappedValues.size;
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
        for(let item of items) {
            this.set(item);
        }
    }
    replace(item) {
        const idx = this.indexOf(item);
        if (idx !== -1) {
            this._items[idx] = item;
        }
    }
    indexOf(item) {
        const idx = sortedIndex(this._items, item, this._comparator);
        if (idx < this._items.length && this._comparator(this._items[idx], item) === 0) {
            return idx;
        } else {
            return -1;
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
                        return result;
                    }
                    it = this._sourceLists[sourceListIdx][Symbol.iterator]();
                    result = it.next();
                }
                return result;
            }
        }
    }
}

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
        if (this.isDisposed) {
            throw new Error("Already disposed, check isDisposed after await if needed");
        }
        this._disposables.push(disposable);
        return disposable;
    }
    dispose() {
        if (this._disposables) {
            for (const d of this._disposables) {
                disposeValue(d);
            }
            this._disposables = null;
        }
    }
    get isDisposed() {
        return this._disposables === null;
    }
    disposeTracked(value) {
        if (value === undefined || value === null || this.isDisposed) {
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

class ReaderRequest {
    constructor(fn) {
        this.decryptRequest = null;
        this._promise = fn(this);
    }
    complete() {
        return this._promise;
    }
    dispose() {
        if (this.decryptRequest) {
            this.decryptRequest.dispose();
            this.decryptRequest = null;
        }
    }
}
class TimelineReader {
    constructor({roomId, storage, fragmentIdComparer}) {
        this._roomId = roomId;
        this._storage = storage;
        this._fragmentIdComparer = fragmentIdComparer;
        this._decryptEntries = null;
    }
    enableEncryption(decryptEntries) {
        this._decryptEntries = decryptEntries;
    }
    _openTxn() {
        const stores = [
            this._storage.storeNames.timelineEvents,
            this._storage.storeNames.timelineFragments,
        ];
        if (this._decryptEntries) {
            stores.push(this._storage.storeNames.inboundGroupSessions);
        }
        return this._storage.readTxn(stores);
    }
    readFrom(eventKey, direction, amount) {
        return new ReaderRequest(async r => {
            const txn = await this._openTxn();
            return await this._readFrom(eventKey, direction, amount, r, txn);
        });
    }
    readFromEnd(amount) {
        return new ReaderRequest(async r => {
            const txn = await this._openTxn();
            const liveFragment = await txn.timelineFragments.liveFragment(this._roomId);
            let entries;
            if (!liveFragment) {
                entries = [];
            } else {
                this._fragmentIdComparer.add(liveFragment);
                const liveFragmentEntry = FragmentBoundaryEntry.end(liveFragment, this._fragmentIdComparer);
                const eventKey = liveFragmentEntry.asEventKey();
                entries = await this._readFrom(eventKey, Direction.Backward, amount, r, txn);
                entries.unshift(liveFragmentEntry);
            }
            return entries;
        });
    }
    async _readFrom(eventKey, direction, amount, r, txn) {
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
            let eventEntries = eventsWithinFragment.map(e => new EventEntry(e, this._fragmentIdComparer));
            entries = directionalConcat(entries, eventEntries, direction);
            if (entries.length < amount) {
                const fragment = await fragmentStore.get(this._roomId, eventKey.fragmentId);
                let fragmentEntry = new FragmentBoundaryEntry(fragment, direction.isBackward, this._fragmentIdComparer);
                directionalAppend(entries, fragmentEntry, direction);
                if (!fragmentEntry.token && fragmentEntry.hasLinkedFragment) {
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
        if (this._decryptEntries) {
            r.decryptRequest = this._decryptEntries(entries, txn);
            try {
                await r.decryptRequest.complete();
            } finally {
                r.decryptRequest = null;
            }
        }
        return entries;
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
        this._disposables = new Disposables();
        this._remoteEntries = new SortedArray((a, b) => a.compare(b));
        this._timelineReader = new TimelineReader({
            roomId: this._roomId,
            storage: this._storage,
            fragmentIdComparer: this._fragmentIdComparer
        });
        this._readerRequest = null;
        const localEntries = new MappedList(pendingEvents, pe => {
            return new PendingEventEntry({pendingEvent: pe, user});
        }, (pee, params) => {
            pee.notifyUpdate(params);
        });
        this._allEntries = new ConcatList(this._remoteEntries, localEntries);
    }
    async load() {
        const readerRequest = this._disposables.track(this._timelineReader.readFromEnd(30));
        try {
            const entries = await readerRequest.complete();
            this._remoteEntries.setManySorted(entries);
        } finally {
            this._disposables.disposeTracked(readerRequest);
        }
    }
    replaceEntries(entries) {
        for (const entry of entries) {
            this._remoteEntries.replace(entry);
        }
    }
    appendLiveEntries(newEntries) {
        this._remoteEntries.setManySorted(newEntries);
    }
    addGapEntries(newEntries) {
        this._remoteEntries.setManySorted(newEntries);
    }
    async loadAtTop(amount) {
        const firstEventEntry = this._remoteEntries.array.find(e => !!e.eventType);
        if (!firstEventEntry) {
            return;
        }
        const readerRequest = this._disposables.track(this._timelineReader.readFrom(
            firstEventEntry.asEventKey(),
            Direction.Backward,
            amount
        ));
        try {
            const entries = await readerRequest.complete();
            this._remoteEntries.setManySorted(entries);
        } finally {
            this._disposables.disposeTracked(readerRequest);
        }
    }
    get entries() {
        return this._allEntries;
    }
    dispose() {
        if (this._closeCallback) {
            this._disposables.dispose();
            this._closeCallback();
            this._closeCallback = null;
        }
    }
    enableEncryption(decryptEntries) {
        this._timelineReader.enableEncryption(decryptEntries);
    }
}

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
    add(fragment) {
        const copy = new Fragment(fragment.id, fragment.previousId, fragment.nextId);
        this._fragmentsById.set(fragment.id, copy);
        this.rebuild(this._fragmentsById.values());
    }
    append(id, previousId) {
        const fragment = new Fragment(id, previousId, null);
        const prevFragment = this._fragmentsById.get(previousId);
        if (prevFragment) {
            prevFragment.nextId = id;
        }
        this._fragmentsById.set(id, fragment);
        this.rebuild(this._fragmentsById.values());
    }
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
    get needsEncryption() { return this._data.needsEncryption; }
    get data() { return this._data; }
    setEncrypted(type, content) {
        this._data.eventType = type;
        this._data.content = content;
        this._data.needsEncryption = false;
    }
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
        this._roomEncryption = null;
    }
    enableEncryption(roomEncryption) {
        this._roomEncryption = roomEncryption;
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
                if (pendingEvent.needsEncryption) {
                    const {type, content} = await this._sendScheduler.request(async hsApi => {
                        return await this._roomEncryption.encrypt(pendingEvent.eventType, pendingEvent.content, hsApi);
                    });
                    pendingEvent.setEncrypted(type, content);
                    await this._tryUpdateEvent(pendingEvent);
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
                txnId: makeTxnId(),
                needsEncryption: !!this._roomEncryption
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

async function loadMembers({roomId, storage}) {
    const txn = await storage.readTxn([
        storage.storeNames.roomMembers,
    ]);
    const memberDatas = await txn.roomMembers.getAll(roomId);
    return memberDatas.map(d => new RoomMember(d));
}
async function fetchMembers({summary, syncToken, roomId, hsApi, storage, setChangedMembersMap}) {
    const changedMembersDuringSync = new Map();
    setChangedMembersMap(changedMembersDuringSync);
    const memberResponse = await hsApi.members(roomId, {at: syncToken}).response();
    const txn = await storage.readWriteTxn([
        storage.storeNames.roomSummary,
        storage.storeNames.roomMembers,
    ]);
    let summaryChanges;
    let members;
    try {
        summaryChanges = summary.writeHasFetchedMembers(true, txn);
        const {roomMembers} = txn;
        const memberEvents = memberResponse.chunk;
        if (!Array.isArray(memberEvents)) {
            throw new Error("malformed");
        }
        members = await Promise.all(memberEvents.map(async memberEvent => {
            const userId = memberEvent?.state_key;
            if (!userId) {
                throw new Error("malformed");
            }
            const changedMember = changedMembersDuringSync.get(userId);
            if (changedMember) {
                return changedMember;
            } else {
                const member = RoomMember.fromMemberEvent(roomId, memberEvent);
                if (member) {
                    roomMembers.set(member.serialize());
                }
                return member;
            }
        }));
    } catch (err) {
        txn.abort();
        throw err;
    } finally {
        setChangedMembersMap(null);
    }
    await txn.complete();
    summary.applyChanges(summaryChanges);
    return members;
}
async function fetchOrLoadMembers(options) {
    const {summary} = options;
    if (!summary.hasFetchedMembers) {
        return fetchMembers(options);
    } else {
        return loadMembers(options);
    }
}

class MemberList {
    constructor({members, closeCallback}) {
        this._members = new ObservableMap();
        for (const member of members) {
            this._members.add(member.userId, member);
        }
        this._closeCallback = closeCallback;
        this._retentionCount = 1;
    }
    afterSync(memberChanges) {
        for (const [userId, memberChange] of memberChanges.entries()) {
            this._members.add(userId, memberChange.member);
        }
    }
    get members() {
        return this._members;
    }
    retain() {
        this._retentionCount += 1;
    }
    release() {
        this._retentionCount -= 1;
        if (this._retentionCount === 0) {
            this._closeCallback();
        }
    }
}

function calculateRoomName(sortedMembers, summary) {
    const countWithoutMe = summary.joinCount + summary.inviteCount - 1;
    if (sortedMembers.length >= countWithoutMe) {
        if (sortedMembers.length > 1) {
            const lastMember = sortedMembers[sortedMembers.length - 1];
            const firstMembers = sortedMembers.slice(0, sortedMembers.length - 1);
            return firstMembers.map(m => m.name).join(", ") + " and " + lastMember.name;
        } else {
            return sortedMembers[0].name;
        }
    } else if (sortedMembers.length < countWithoutMe) {
        return sortedMembers.map(m => m.name).join(", ") + ` and ${countWithoutMe} others`;
    } else {
        return null;
    }
}
class Heroes {
    constructor(roomId) {
        this._roomId = roomId;
        this._members = new Map();
    }
    async calculateChanges(newHeroes, memberChanges, txn) {
        const updatedHeroMembers = new Map();
        const removedUserIds = [];
        for (const existingUserId of this._members.keys()) {
            if (newHeroes.indexOf(existingUserId) === -1) {
                removedUserIds.push(existingUserId);
            }
        }
        for (const [userId, memberChange] of memberChanges.entries()) {
            if (this._members.has(userId) || newHeroes.indexOf(userId) !== -1) {
                updatedHeroMembers.set(userId, memberChange.member);
            }
        }
        for (const userId of newHeroes) {
            if (!this._members.has(userId) && !updatedHeroMembers.has(userId)) {
                const memberData = await txn.roomMembers.get(this._roomId, userId);
                if (memberData) {
                    const member = new RoomMember(memberData);
                    updatedHeroMembers.set(member.userId, member);
                }
            }
        }
        return {updatedHeroMembers: updatedHeroMembers.values(), removedUserIds};
    }
    applyChanges({updatedHeroMembers, removedUserIds}, summary) {
        for (const userId of removedUserIds) {
            this._members.delete(userId);
        }
        for (const member of updatedHeroMembers) {
            this._members.set(member.userId, member);
        }
        const sortedMembers = Array.from(this._members.values()).sort((a, b) => a.name.localeCompare(b.name));
        this._roomName = calculateRoomName(sortedMembers, summary);
    }
    get roomName() {
        return this._roomName;
    }
    get roomAvatarUrl() {
        if (this._members.size === 1) {
            for (const member of this._members.values()) {
                return member.avatarUrl;
            }
        }
        return null;
    }
}

const EVENT_ENCRYPTED_TYPE = "m.room.encrypted";
class Room extends EventEmitter {
	constructor({roomId, storage, hsApi, emitCollectionChange, sendScheduler, pendingEvents, user, createRoomEncryption, getSyncToken}) {
        super();
        this._roomId = roomId;
        this._storage = storage;
        this._hsApi = hsApi;
		this._summary = new RoomSummary(roomId, user.id);
        this._fragmentIdComparer = new FragmentIdComparer([]);
		this._syncWriter = new SyncWriter({roomId, fragmentIdComparer: this._fragmentIdComparer});
        this._emitCollectionChange = emitCollectionChange;
        this._sendQueue = new SendQueue({roomId, storage, sendScheduler, pendingEvents});
        this._timeline = null;
        this._user = user;
        this._changedMembersDuringSync = null;
        this._memberList = null;
        this._createRoomEncryption = createRoomEncryption;
        this._roomEncryption = null;
        this._getSyncToken = getSyncToken;
	}
    async notifyRoomKeys(roomKeys) {
        if (this._roomEncryption) {
            let retryEventIds = this._roomEncryption.applyRoomKeys(roomKeys);
            if (retryEventIds.length) {
                const retryEntries = [];
                const txn = await this._storage.readTxn([
                    this._storage.storeNames.timelineEvents,
                    this._storage.storeNames.inboundGroupSessions,
                ]);
                for (const eventId of retryEventIds) {
                    const storageEntry = await txn.timelineEvents.getByEventId(this._roomId, eventId);
                    if (storageEntry) {
                        retryEntries.push(new EventEntry(storageEntry, this._fragmentIdComparer));
                    }
                }
                const decryptRequest = this._decryptEntries(DecryptionSource.Retry, retryEntries, txn);
                await decryptRequest.complete();
                if (this._timeline) {
                    this._timeline.replaceEntries(retryEntries);
                }
            }
        }
    }
    _enableEncryption(encryptionParams) {
        this._roomEncryption = this._createRoomEncryption(this, encryptionParams);
        if (this._roomEncryption) {
            this._sendQueue.enableEncryption(this._roomEncryption);
            if (this._timeline) {
                this._timeline.enableEncryption(this._decryptEntries.bind(this, DecryptionSource.Timeline));
            }
        }
    }
    _decryptEntries(source, entries, inboundSessionTxn = null) {
        const request = new DecryptionRequest(async r => {
            if (!inboundSessionTxn) {
                inboundSessionTxn = await this._storage.readTxn([this._storage.storeNames.inboundGroupSessions]);
            }
            if (r.cancelled) return;
            const events = entries.filter(entry => {
                return entry.eventType === EVENT_ENCRYPTED_TYPE;
            }).map(entry => entry.event);
            const isTimelineOpen = this._isTimelineOpen;
            r.preparation = await this._roomEncryption.prepareDecryptAll(events, source, isTimelineOpen, inboundSessionTxn);
            if (r.cancelled) return;
            const changes = await r.preparation.decrypt();
            r.preparation = null;
            if (r.cancelled) return;
            const stores = [this._storage.storeNames.groupSessionDecryptions];
            if (isTimelineOpen) {
                stores.push(this._storage.storeNames.deviceIdentities);
            }
            const writeTxn = await this._storage.readWriteTxn(stores);
            let decryption;
            try {
                decryption = await changes.write(writeTxn);
            } catch (err) {
                writeTxn.abort();
                throw err;
            }
            await writeTxn.complete();
            decryption.applyToEntries(entries);
        });
        return request;
    }
    get needsPrepareSync() {
        return !!this._roomEncryption;
    }
    async prepareSync(roomResponse, txn) {
        if (this._roomEncryption) {
            const events = roomResponse?.timeline?.events;
            if (Array.isArray(events)) {
                const eventsToDecrypt = events.filter(event => {
                    return event?.type === EVENT_ENCRYPTED_TYPE;
                });
                const preparation = await this._roomEncryption.prepareDecryptAll(
                    eventsToDecrypt, DecryptionSource.Sync, this._isTimelineOpen, txn);
                return preparation;
            }
        }
    }
    async afterPrepareSync(preparation) {
        if (preparation) {
            const decryptChanges = await preparation.decrypt();
            return decryptChanges;
        }
    }
    async writeSync(roomResponse, membership, isInitialSync, decryptChanges, txn) {
        let decryption;
        if (this._roomEncryption && decryptChanges) {
            decryption = await decryptChanges.write(txn);
        }
		const {entries, newLiveKey, memberChanges} =
            await this._syncWriter.writeSync(roomResponse, this.isTrackingMembers, txn);
        if (decryption) {
            decryption.applyToEntries(entries);
        }
        if (this._roomEncryption && this.isTrackingMembers && memberChanges?.size) {
            await this._roomEncryption.writeMemberChanges(memberChanges, txn);
        }
		const summaryChanges = this._summary.writeSync(
            roomResponse,
            membership,
            isInitialSync, this._isTimelineOpen,
            txn);
        let heroChanges;
        if (needsHeroes(summaryChanges)) {
            if (!this._heroes) {
                this._heroes = new Heroes(this._roomId);
            }
            heroChanges = await this._heroes.calculateChanges(summaryChanges.heroes, memberChanges, txn);
        }
        let removedPendingEvents;
        if (roomResponse.timeline && roomResponse.timeline.events) {
            removedPendingEvents = this._sendQueue.removeRemoteEchos(roomResponse.timeline.events, txn);
        }
        return {
            summaryChanges,
            newTimelineEntries: entries,
            newLiveKey,
            removedPendingEvents,
            memberChanges,
            heroChanges,
        };
    }
    afterSync({summaryChanges, newTimelineEntries, newLiveKey, removedPendingEvents, memberChanges, heroChanges}) {
        this._syncWriter.afterSync(newLiveKey);
        if (!this._summary.encryption && summaryChanges.encryption && !this._roomEncryption) {
            this._enableEncryption(summaryChanges.encryption);
        }
        if (memberChanges.size) {
            if (this._changedMembersDuringSync) {
                for (const [userId, memberChange] of memberChanges.entries()) {
                    this._changedMembersDuringSync.set(userId, memberChange.member);
                }
            }
            if (this._memberList) {
                this._memberList.afterSync(memberChanges);
            }
        }
        let emitChange = false;
        if (summaryChanges) {
            this._summary.applyChanges(summaryChanges);
            if (!this._summary.needsHeroes) {
                this._heroes = null;
            }
            emitChange = true;
        }
        if (this._heroes && heroChanges) {
            const oldName = this.name;
            this._heroes.applyChanges(heroChanges, this._summary);
            if (oldName !== this.name) {
                emitChange = true;
            }
        }
        if (emitChange) {
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
    needsAfterSyncCompleted({memberChanges}) {
        return this._roomEncryption?.needsToShareKeys(memberChanges);
    }
    async afterSyncCompleted({memberChanges}) {
        if (this._roomEncryption) {
            await this._roomEncryption.shareRoomKeyForMemberChanges(memberChanges, this._hsApi);
        }
    }
    async start() {
        if (this._roomEncryption) {
            try {
                await this._roomEncryption.shareRoomKeyToPendingMembers(this._hsApi);
            } catch (err) {
                console.error(`could not send out pending room keys for room ${this.id}`, err.stack);
            }
        }
        this._sendQueue.resumeSending();
    }
	async load(summary, txn) {
        try {
            this._summary.load(summary);
            if (this._summary.encryption) {
                this._enableEncryption(this._summary.encryption);
            }
            if (this._summary.needsHeroes) {
                this._heroes = new Heroes(this._roomId);
                const changes = await this._heroes.calculateChanges(this._summary.heroes, [], txn);
                this._heroes.applyChanges(changes, this._summary);
            }
            return this._syncWriter.load(txn);
        } catch (err) {
            throw new WrappedError(`Could not load room ${this._roomId}`, err);
        }
	}
    sendEvent(eventType, content) {
        return this._sendQueue.enqueueEvent(eventType, content);
    }
    async loadMemberList() {
        if (this._memberList) {
            this._memberList.retain();
            return this._memberList;
        } else {
            const members = await fetchOrLoadMembers({
                summary: this._summary,
                roomId: this._roomId,
                hsApi: this._hsApi,
                storage: this._storage,
                syncToken: this._getSyncToken(),
                setChangedMembersMap: map => this._changedMembersDuringSync = map,
            });
            this._memberList = new MemberList({
                members,
                closeCallback: () => { this._memberList = null; }
            });
            return this._memberList;
        }
    }
    async fillGap(fragmentEntry, amount) {
        if (fragmentEntry.edgeReached) {
            return;
        }
        const response = await this._hsApi.messages(this._roomId, {
            from: fragmentEntry.token,
            dir: fragmentEntry.direction.asApiString(),
            limit: amount,
            filter: {
                lazy_load_members: true,
                include_redundant_members: true,
            }
        }).response();
        const txn = await this._storage.readWriteTxn([
            this._storage.storeNames.pendingEvents,
            this._storage.storeNames.timelineEvents,
            this._storage.storeNames.timelineFragments,
        ]);
        let removedPendingEvents;
        let gapResult;
        try {
            removedPendingEvents = this._sendQueue.removeRemoteEchos(response.chunk, txn);
            const gapWriter = new GapWriter({
                roomId: this._roomId,
                storage: this._storage,
                fragmentIdComparer: this._fragmentIdComparer,
            });
            gapResult = await gapWriter.writeFragmentFill(fragmentEntry, response, txn);
        } catch (err) {
            txn.abort();
            throw err;
        }
        await txn.complete();
        if (this._roomEncryption) {
            const decryptRequest = this._decryptEntries(DecryptionSource.Timeline, gapResult.entries);
            await decryptRequest.complete();
        }
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
        if (this._heroes) {
            return this._heroes.roomName;
        }
        return this._summary.name;
    }
    get id() {
        return this._roomId;
    }
    get avatarUrl() {
        if (this._summary.avatarUrl) {
            return this._summary.avatarUrl;
        } else if (this._heroes) {
            return this._heroes.roomAvatarUrl;
        }
        return null;
    }
    get lastMessageTimestamp() {
        return this._summary.lastMessageTimestamp;
    }
    get isUnread() {
        return this._summary.isUnread;
    }
    get notificationCount() {
        return this._summary.notificationCount;
    }
    get highlightCount() {
        return this._summary.highlightCount;
    }
    get isLowPriority() {
        const tags = this._summary.tags;
        return !!(tags && tags['m.lowpriority']);
    }
    get isEncrypted() {
        return !!this._summary.encryption;
    }
    get isTrackingMembers() {
        return this._summary.isTrackingMembers;
    }
    async _getLastEventId() {
        const lastKey = this._syncWriter.lastMessageKey;
        if (lastKey) {
            const txn = await this._storage.readTxn([
                this._storage.storeNames.timelineEvents,
            ]);
            const eventEntry = await txn.timelineEvents.get(this._roomId, lastKey);
            return eventEntry?.event?.event_id;
        }
    }
    get _isTimelineOpen() {
        return !!this._timeline;
    }
    async clearUnread() {
        if (this.isUnread || this.notificationCount) {
            const txn = await this._storage.readWriteTxn([
                this._storage.storeNames.roomSummary,
            ]);
            let data;
            try {
                data = this._summary.writeClearUnread(txn);
            } catch (err) {
                txn.abort();
                throw err;
            }
            await txn.complete();
            this._summary.applyChanges(data);
            this.emit("change");
            this._emitCollectionChange(this);
            try {
                const lastEventId = await this._getLastEventId();
                if (lastEventId) {
                    await this._hsApi.receipt(this._roomId, "m.read", lastEventId);
                }
            } catch (err) {
                if (err.name !== "ConnectionError") {
                    throw err;
                }
            }
        }
    }
    openTimeline() {
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
                if (this._roomEncryption) {
                    this._roomEncryption.notifyTimelineClosed();
                }
            },
            user: this._user,
        });
        if (this._roomEncryption) {
            this._timeline.enableEncryption(this._decryptEntries.bind(this, DecryptionSource.Timeline));
        }
        return this._timeline;
    }
    get mediaRepository() {
        return this._hsApi.mediaRepository;
    }
    writeIsTrackingMembers(value, txn) {
        return this._summary.writeIsTrackingMembers(value, txn);
    }
    applyIsTrackingMembersChanges(changes) {
        this._summary.applyChanges(changes);
    }
}
class DecryptionRequest {
    constructor(decryptFn) {
        this._cancelled = false;
        this.preparation = null;
        this._promise = decryptFn(this);
    }
    complete() {
        return this._promise;
    }
    get cancelled() {
        return this._cancelled;
    }
    dispose() {
        this._cancelled = true;
        if (this.preparation) {
            this.preparation.dispose();
        }
    }
}

class RateLimitingBackoff {
    constructor() {
        this._remainingRateLimitedRequest = 0;
    }
    async waitAfterLimitExceeded(retryAfterMs) {
        if (!retryAfterMs) {
            retryAfterMs = 5000;
        }
        await WebPlatform.delay(retryAfterMs);
    }
    async waitForNextSend() {
    }
}
class SendScheduler {
    constructor({hsApi, backoff}) {
        this._hsApi = hsApi;
        this._sendRequests = [];
        this._sendScheduled = false;
        this._stopped = false;
        this._waitTime = 0;
        this._backoff = backoff;
    }
    stop() {
    }
    start() {
        this._stopped = false;
    }
    get isStarted() {
        return !this._stopped;
    }
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
                result = await this._doSend(request.sendCallback);
            } catch (err) {
                if (err instanceof ConnectionError) {
                    this._stopped = true;
                    for (const r of this._sendRequests) {
                        r.reject(err);
                    }
                    this._sendRequests = [];
                }
                console.error("error for request", err);
                request.reject(err);
                break;
            }
            request.resolve(result);
        }
    }
    async _doSend(sendCallback) {
        this._sendScheduled = false;
        await this._backoff.waitForNextSend();
        while (true) {
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

function groupBy(array, groupFn) {
    return groupByWithCreator(array, groupFn,
        () => {return [];},
        (array, value) => array.push(value)
    );
}
function groupByWithCreator(array, groupFn, createCollectionFn, addCollectionFn) {
    return array.reduce((map, value) => {
        const key = groupFn(value);
        let collection = map.get(key);
        if (!collection) {
            collection = createCollectionFn();
            map.set(key, collection);
        }
        addCollectionFn(collection, value);
        return map;
    }, new Map());
}

const PENDING_ENCRYPTED_EVENTS = "pendingEncryptedDeviceEvents";
class DeviceMessageHandler {
    constructor({storage}) {
        this._storage = storage;
        this._olmDecryption = null;
        this._megolmDecryption = null;
    }
    enableEncryption({olmDecryption, megolmDecryption}) {
        this._olmDecryption = olmDecryption;
        this._megolmDecryption = megolmDecryption;
    }
    async writeSync(toDeviceEvents, txn) {
        const encryptedEvents = toDeviceEvents.filter(e => e.type === "m.room.encrypted");
        let pendingEvents = await this._getPendingEvents(txn);
        pendingEvents = pendingEvents.concat(encryptedEvents);
        txn.session.set(PENDING_ENCRYPTED_EVENTS, pendingEvents);
    }
    async _writeDecryptedEvents(olmResults, txn) {
        const megOlmRoomKeysResults = olmResults.filter(r => {
            return r.event?.type === "m.room_key" && r.event.content?.algorithm === MEGOLM_ALGORITHM;
        });
        let roomKeys;
        if (megOlmRoomKeysResults.length) {
            console.log("new room keys", megOlmRoomKeysResults);
            roomKeys = await this._megolmDecryption.addRoomKeys(megOlmRoomKeysResults, txn);
        }
        return {roomKeys};
    }
    _applyDecryptChanges(rooms, {roomKeys}) {
        if (roomKeys && roomKeys.length) {
            const roomKeysByRoom = groupBy(roomKeys, s => s.roomId);
            for (const [roomId, roomKeys] of roomKeysByRoom) {
                const room = rooms.get(roomId);
                room?.notifyRoomKeys(roomKeys);
            }
        }
    }
    async decryptPending(rooms) {
        if (!this._olmDecryption) {
            return;
        }
        const readTxn = await this._storage.readTxn([this._storage.storeNames.session]);
        const pendingEvents = await this._getPendingEvents(readTxn);
        if (pendingEvents.length === 0) {
           return;
        }
        const olmEvents = pendingEvents.filter(e => e.content?.algorithm === OLM_ALGORITHM);
        const decryptChanges = await this._olmDecryption.decryptAll(olmEvents);
        for (const err of decryptChanges.errors) {
            console.warn("decryption failed for event", err, err.event);
        }
        const txn = await this._storage.readWriteTxn([
            this._storage.storeNames.session,
            this._storage.storeNames.olmSessions,
            this._storage.storeNames.inboundGroupSessions,
        ]);
        let changes;
        try {
            changes = await this._writeDecryptedEvents(decryptChanges.results, txn);
            decryptChanges.write(txn);
            txn.session.remove(PENDING_ENCRYPTED_EVENTS);
        } catch (err) {
            txn.abort();
            throw err;
        }
        await txn.complete();
        this._applyDecryptChanges(rooms, changes);
    }
    async _getPendingEvents(txn) {
        return (await txn.session.get(PENDING_ENCRYPTED_EVENTS)) || [];
    }
}

const ACCOUNT_SESSION_KEY = SESSION_KEY_PREFIX + "olmAccount";
const DEVICE_KEY_FLAG_SESSION_KEY = SESSION_KEY_PREFIX + "areDeviceKeysUploaded";
const SERVER_OTK_COUNT_SESSION_KEY = SESSION_KEY_PREFIX + "serverOTKCount";
class Account {
    static async load({olm, pickleKey, hsApi, userId, deviceId, txn}) {
        const pickledAccount = await txn.session.get(ACCOUNT_SESSION_KEY);
        if (pickledAccount) {
            const account = new olm.Account();
            const areDeviceKeysUploaded = await txn.session.get(DEVICE_KEY_FLAG_SESSION_KEY);
            account.unpickle(pickleKey, pickledAccount);
            const serverOTKCount = await txn.session.get(SERVER_OTK_COUNT_SESSION_KEY);
            return new Account({pickleKey, hsApi, account, userId,
                deviceId, areDeviceKeysUploaded, serverOTKCount, olm});
        }
    }
    static async create({olm, pickleKey, hsApi, userId, deviceId, txn}) {
        const account = new olm.Account();
        account.create();
        account.generate_one_time_keys(account.max_number_of_one_time_keys());
        const pickledAccount = account.pickle(pickleKey);
        const areDeviceKeysUploaded = false;
        await txn.session.add(ACCOUNT_SESSION_KEY, pickledAccount);
        await txn.session.add(DEVICE_KEY_FLAG_SESSION_KEY, areDeviceKeysUploaded);
        await txn.session.add(SERVER_OTK_COUNT_SESSION_KEY, 0);
        return new Account({pickleKey, hsApi, account, userId,
            deviceId, areDeviceKeysUploaded, serverOTKCount: 0, olm});
    }
    constructor({pickleKey, hsApi, account, userId, deviceId, areDeviceKeysUploaded, serverOTKCount, olm}) {
        this._olm = olm;
        this._pickleKey = pickleKey;
        this._hsApi = hsApi;
        this._account = account;
        this._userId = userId;
        this._deviceId = deviceId;
        this._areDeviceKeysUploaded = areDeviceKeysUploaded;
        this._serverOTKCount = serverOTKCount;
        this._identityKeys = JSON.parse(this._account.identity_keys());
    }
    get identityKeys() {
        return this._identityKeys;
    }
    async uploadKeys(storage) {
        const oneTimeKeys = JSON.parse(this._account.one_time_keys());
        const oneTimeKeysEntries = Object.entries(oneTimeKeys.curve25519);
        if (oneTimeKeysEntries.length || !this._areDeviceKeysUploaded) {
            const payload = {};
            if (!this._areDeviceKeysUploaded) {
                const identityKeys = JSON.parse(this._account.identity_keys());
                payload.device_keys = this._deviceKeysPayload(identityKeys);
            }
            if (oneTimeKeysEntries.length) {
                payload.one_time_keys = this._oneTimeKeysPayload(oneTimeKeysEntries);
            }
            const response = await this._hsApi.uploadKeys(payload).response();
            this._serverOTKCount = response?.one_time_key_counts?.signed_curve25519;
            await this._updateSessionStorage(storage, sessionStore => {
                if (oneTimeKeysEntries.length) {
                    this._account.mark_keys_as_published();
                    sessionStore.set(ACCOUNT_SESSION_KEY, this._account.pickle(this._pickleKey));
                    sessionStore.set(SERVER_OTK_COUNT_SESSION_KEY, this._serverOTKCount);
                }
                if (!this._areDeviceKeysUploaded) {
                    this._areDeviceKeysUploaded = true;
                    sessionStore.set(DEVICE_KEY_FLAG_SESSION_KEY, this._areDeviceKeysUploaded);
                }
            });
        }
    }
    async generateOTKsIfNeeded(storage) {
        const maxOTKs = this._account.max_number_of_one_time_keys();
        const limit = maxOTKs / 2;
        if (this._serverOTKCount < limit) {
            const oneTimeKeys = JSON.parse(this._account.one_time_keys());
            const oneTimeKeysEntries = Object.entries(oneTimeKeys.curve25519);
            const unpublishedOTKCount = oneTimeKeysEntries.length;
            const totalOTKCount = this._serverOTKCount + unpublishedOTKCount;
            if (totalOTKCount < limit) {
                await this._updateSessionStorage(storage, sessionStore => {
                    const newKeyCount = maxOTKs - totalOTKCount;
                    this._account.generate_one_time_keys(newKeyCount);
                    sessionStore.set(ACCOUNT_SESSION_KEY, this._account.pickle(this._pickleKey));
                });
                return true;
            }
        }
        return false;
    }
    createInboundOlmSession(senderKey, body) {
        const newSession = new this._olm.Session();
        try {
            newSession.create_inbound_from(this._account, senderKey, body);
            return newSession;
        } catch (err) {
            newSession.free();
            throw err;
        }
    }
    createOutboundOlmSession(theirIdentityKey, theirOneTimeKey) {
        const newSession = new this._olm.Session();
        try {
            newSession.create_outbound(this._account, theirIdentityKey, theirOneTimeKey);
            return newSession;
        } catch (err) {
            newSession.free();
            throw err;
        }
    }
    writeRemoveOneTimeKey(session, txn) {
        this._account.remove_one_time_keys(session);
        txn.session.set(ACCOUNT_SESSION_KEY, this._account.pickle(this._pickleKey));
    }
    writeSync(deviceOneTimeKeysCount, txn) {
        const otkCount = deviceOneTimeKeysCount.signed_curve25519;
        if (Number.isSafeInteger(otkCount) && otkCount !== this._serverOTKCount) {
            txn.session.set(SERVER_OTK_COUNT_SESSION_KEY, otkCount);
            return otkCount;
        }
    }
    afterSync(otkCount) {
        if (Number.isSafeInteger(otkCount)) {
            this._serverOTKCount = otkCount;
        }
    }
    _deviceKeysPayload(identityKeys) {
        const obj = {
            user_id: this._userId,
            device_id: this._deviceId,
            algorithms: [OLM_ALGORITHM, MEGOLM_ALGORITHM],
            keys: {}
        };
        for (const [algorithm, pubKey] of Object.entries(identityKeys)) {
            obj.keys[`${algorithm}:${this._deviceId}`] = pubKey;
        }
        this.signObject(obj);
        return obj;
    }
    _oneTimeKeysPayload(oneTimeKeysEntries) {
        const obj = {};
        for (const [keyId, pubKey] of oneTimeKeysEntries) {
            const keyObj = {
                key: pubKey
            };
            this.signObject(keyObj);
            obj[`signed_curve25519:${keyId}`] = keyObj;
        }
        return obj;
    }
    async _updateSessionStorage(storage, callback) {
        const txn = await storage.readWriteTxn([
            storage.storeNames.session
        ]);
        try {
            await callback(txn.session);
        } catch (err) {
            txn.abort();
            throw err;
        }
        await txn.complete();
    }
    signObject(obj) {
        const sigs = obj.signatures || {};
        const unsigned = obj.unsigned;
        delete obj.signatures;
        delete obj.unsigned;
        sigs[this._userId] = sigs[this._userId] || {};
        sigs[this._userId]["ed25519:" + this._deviceId] =
            this._account.sign(anotherJson.stringify(obj));
        obj.signatures = sigs;
        if (unsigned !== undefined) {
            obj.unsigned = unsigned;
        }
    }
}

function createSessionEntry(olmSession, senderKey, timestamp, pickleKey) {
    return {
        session: olmSession.pickle(pickleKey),
        sessionId: olmSession.session_id(),
        senderKey,
        lastUsed: timestamp,
    };
}
class Session {
    constructor(data, pickleKey, olm, isNew = false) {
        this.data = data;
        this._olm = olm;
        this._pickleKey = pickleKey;
        this.isNew = isNew;
        this.isModified = isNew;
    }
    static create(senderKey, olmSession, olm, pickleKey, timestamp) {
        const data = createSessionEntry(olmSession, senderKey, timestamp, pickleKey);
        return new Session(data, pickleKey, olm, true);
    }
    get id() {
        return this.data.sessionId;
    }
    load() {
        const session = new this._olm.Session();
        session.unpickle(this._pickleKey, this.data.session);
        return session;
    }
    unload(olmSession) {
        olmSession.free();
    }
    save(olmSession) {
        this.data.session = olmSession.pickle(this._pickleKey);
        this.isModified = true;
    }
}

class DecryptionResult {
    constructor(event, senderCurve25519Key, claimedKeys) {
        this.event = event;
        this.senderCurve25519Key = senderCurve25519Key;
        this.claimedEd25519Key = claimedKeys.ed25519;
        this._device = null;
        this._roomTracked = true;
    }
    setDevice(device) {
        this._device = device;
    }
    setRoomNotTrackedYet() {
        this._roomTracked = false;
    }
    get isVerified() {
        if (this._device) {
            const comesFromDevice = this._device.ed25519Key === this.claimedEd25519Key;
            return comesFromDevice;
        }
        return false;
    }
    get isUnverified() {
        if (this._device) {
            return !this.isVerified;
        } else if (this.isVerificationUnknown) {
            return false;
        } else {
            return true;
        }
    }
    get isVerificationUnknown() {
        return !this._device && !this._roomTracked;
    }
}

const SESSION_LIMIT_PER_SENDER_KEY = 4;
function isPreKeyMessage(message) {
    return message.type === 0;
}
function sortSessions(sessions) {
    sessions.sort((a, b) => {
        return b.data.lastUsed - a.data.lastUsed;
    });
}
class Decryption {
    constructor({account, pickleKey, now, ownUserId, storage, olm, senderKeyLock}) {
        this._account = account;
        this._pickleKey = pickleKey;
        this._now = now;
        this._ownUserId = ownUserId;
        this._storage = storage;
        this._olm = olm;
        this._senderKeyLock = senderKeyLock;
    }
    async decryptAll(events) {
        const eventsPerSenderKey = groupBy(events, event => event.content?.["sender_key"]);
        const timestamp = this._now();
        const locks = await Promise.all(Array.from(eventsPerSenderKey.keys()).map(senderKey => {
            return this._senderKeyLock.takeLock(senderKey);
        }));
        try {
            const readSessionsTxn = await this._storage.readTxn([this._storage.storeNames.olmSessions]);
            const senderKeyOperations = await Promise.all(Array.from(eventsPerSenderKey.entries()).map(([senderKey, events]) => {
                return this._decryptAllForSenderKey(senderKey, events, timestamp, readSessionsTxn);
            }));
            const results = senderKeyOperations.reduce((all, r) => all.concat(r.results), []);
            const errors = senderKeyOperations.reduce((all, r) => all.concat(r.errors), []);
            const senderKeyDecryptions = senderKeyOperations.map(r => r.senderKeyDecryption);
            return new DecryptionChanges(senderKeyDecryptions, results, errors, this._account, locks);
        } catch (err) {
            for (const lock of locks) {
                lock.release();
            }
            throw err;
        }
    }
    async _decryptAllForSenderKey(senderKey, events, timestamp, readSessionsTxn) {
        const sessions = await this._getSessions(senderKey, readSessionsTxn);
        const senderKeyDecryption = new SenderKeyDecryption(senderKey, sessions, this._olm, timestamp);
        const results = [];
        const errors = [];
        for (const event of events) {
            try {
                const result = this._decryptForSenderKey(senderKeyDecryption, event, timestamp);
                results.push(result);
            } catch (err) {
                errors.push(err);
            }
        }
        return {results, errors, senderKeyDecryption};
    }
    _decryptForSenderKey(senderKeyDecryption, event, timestamp) {
        const senderKey = senderKeyDecryption.senderKey;
        const message = this._getMessageAndValidateEvent(event);
        let plaintext;
        try {
            plaintext = senderKeyDecryption.decrypt(message);
        } catch (err) {
            throw new DecryptionError("OLM_BAD_ENCRYPTED_MESSAGE", event, {senderKey, error: err.message});
        }
        if (typeof plaintext !== "string" && isPreKeyMessage(message)) {
            const createResult = this._createSessionAndDecrypt(senderKey, message, timestamp);
            senderKeyDecryption.addNewSession(createResult.session);
            plaintext = createResult.plaintext;
        }
        if (typeof plaintext === "string") {
            let payload;
            try {
                payload = JSON.parse(plaintext);
            } catch (err) {
                throw new DecryptionError("PLAINTEXT_NOT_JSON", event, {plaintext, err});
            }
            this._validatePayload(payload, event);
            return new DecryptionResult(payload, senderKey, payload.keys);
        } else {
            throw new DecryptionError("OLM_NO_MATCHING_SESSION", event,
                {knownSessionIds: senderKeyDecryption.sessions.map(s => s.id)});
        }
    }
    _createSessionAndDecrypt(senderKey, message, timestamp) {
        let plaintext;
        const olmSession = this._account.createInboundOlmSession(senderKey, message.body);
        try {
            plaintext = olmSession.decrypt(message.type, message.body);
            const session = Session.create(senderKey, olmSession, this._olm, this._pickleKey, timestamp);
            session.unload(olmSession);
            return {session, plaintext};
        } catch (err) {
            olmSession.free();
            throw err;
        }
    }
    _getMessageAndValidateEvent(event) {
        const ciphertext = event.content?.ciphertext;
        if (!ciphertext) {
            throw new DecryptionError("OLM_MISSING_CIPHERTEXT", event);
        }
        const message = ciphertext?.[this._account.identityKeys.curve25519];
        if (!message) {
            throw new DecryptionError("OLM_NOT_INCLUDED_IN_RECIPIENTS", event);
        }
        return message;
    }
    async _getSessions(senderKey, txn) {
        const sessionEntries = await txn.olmSessions.getAll(senderKey);
        const sessions = sessionEntries.map(s => new Session(s, this._pickleKey, this._olm));
        sortSessions(sessions);
        return sessions;
    }
    _validatePayload(payload, event) {
        if (payload.sender !== event.sender) {
            throw new DecryptionError("OLM_FORWARDED_MESSAGE", event, {sentBy: event.sender, encryptedBy: payload.sender});
        }
        if (payload.recipient !== this._ownUserId) {
            throw new DecryptionError("OLM_BAD_RECIPIENT", event, {recipient: payload.recipient});
        }
        if (payload.recipient_keys?.ed25519 !== this._account.identityKeys.ed25519) {
            throw new DecryptionError("OLM_BAD_RECIPIENT_KEY", event, {key: payload.recipient_keys?.ed25519});
        }
        if (!payload.type) {
            throw new DecryptionError("missing type on payload", event, {payload});
        }
        if (typeof payload.keys?.ed25519 !== "string") {
            throw new DecryptionError("Missing or invalid claimed ed25519 key on payload", event, {payload});
        }
    }
}
class SenderKeyDecryption {
    constructor(senderKey, sessions, olm, timestamp) {
        this.senderKey = senderKey;
        this.sessions = sessions;
        this._olm = olm;
        this._timestamp = timestamp;
    }
    addNewSession(session) {
        this.sessions.unshift(session);
    }
    decrypt(message) {
        for (const session of this.sessions) {
            const plaintext = this._decryptWithSession(session, message);
            if (typeof plaintext === "string") {
                sortSessions(this.sessions);
                return plaintext;
            }
        }
    }
    getModifiedSessions() {
        return this.sessions.filter(session => session.isModified);
    }
    get hasNewSessions() {
        return this.sessions.some(session => session.isNew);
    }
    _decryptWithSession(session, message) {
        const olmSession = session.load();
        try {
            if (isPreKeyMessage(message) && !olmSession.matches_inbound(message.body)) {
                return;
            }
            try {
                const plaintext = olmSession.decrypt(message.type, message.body);
                session.save(olmSession);
                session.lastUsed = this._timestamp;
                return plaintext;
            } catch (err) {
                if (isPreKeyMessage(message)) {
                    throw new Error(`Error decrypting prekey message with existing session id ${session.id}: ${err.message}`);
                }
                return;
            }
        } finally {
            session.unload(olmSession);
        }
    }
}
class DecryptionChanges {
    constructor(senderKeyDecryptions, results, errors, account, locks) {
        this._senderKeyDecryptions = senderKeyDecryptions;
        this._account = account;
        this.results = results;
        this.errors = errors;
        this._locks = locks;
    }
    get hasNewSessions() {
        return this._senderKeyDecryptions.some(skd => skd.hasNewSessions);
    }
    write(txn) {
        try {
            for (const senderKeyDecryption of this._senderKeyDecryptions) {
                for (const session of senderKeyDecryption.getModifiedSessions()) {
                    txn.olmSessions.set(session.data);
                    if (session.isNew) {
                        const olmSession = session.load();
                        try {
                            this._account.writeRemoveOneTimeKey(olmSession, txn);
                        } finally {
                            session.unload(olmSession);
                        }
                    }
                }
                if (senderKeyDecryption.sessions.length > SESSION_LIMIT_PER_SENDER_KEY) {
                    const {senderKey, sessions} = senderKeyDecryption;
                    for (let i = sessions.length - 1; i >= SESSION_LIMIT_PER_SENDER_KEY ; i -= 1) {
                        const session = sessions[i];
                        txn.olmSessions.remove(senderKey, session.id);
                    }
                }
            }
        } finally {
            for (const lock of this._locks) {
                lock.release();
            }
        }
    }
}

function findFirstSessionId(sessionIds) {
    return sessionIds.reduce((first, sessionId) => {
        if (!first || sessionId < first) {
            return sessionId;
        } else {
            return first;
        }
    }, null);
}
const OTK_ALGORITHM = "signed_curve25519";
const MAX_BATCH_SIZE = 50;
class Encryption {
    constructor({account, olm, olmUtil, ownUserId, storage, now, pickleKey, senderKeyLock}) {
        this._account = account;
        this._olm = olm;
        this._olmUtil = olmUtil;
        this._ownUserId = ownUserId;
        this._storage = storage;
        this._now = now;
        this._pickleKey = pickleKey;
        this._senderKeyLock = senderKeyLock;
    }
    async encrypt(type, content, devices, hsApi) {
        let messages = [];
        for (let i = 0; i < devices.length ; i += MAX_BATCH_SIZE) {
            const batchDevices = devices.slice(i, i + MAX_BATCH_SIZE);
            const batchMessages = await this._encryptForMaxDevices(type, content, batchDevices, hsApi);
            messages = messages.concat(batchMessages);
        }
        return messages;
    }
    async _encryptForMaxDevices(type, content, devices, hsApi) {
        const locks = await Promise.all(devices.map(device => {
            return this._senderKeyLock.takeLock(device.curve25519Key);
        }));
        try {
            const {
                devicesWithoutSession,
                existingEncryptionTargets,
            } = await this._findExistingSessions(devices);
            const timestamp = this._now();
            let encryptionTargets = [];
            try {
                if (devicesWithoutSession.length) {
                    const newEncryptionTargets = await this._createNewSessions(
                        devicesWithoutSession, hsApi, timestamp);
                    encryptionTargets = encryptionTargets.concat(newEncryptionTargets);
                }
                await this._loadSessions(existingEncryptionTargets);
                encryptionTargets = encryptionTargets.concat(existingEncryptionTargets);
                const messages = encryptionTargets.map(target => {
                    const encryptedContent = this._encryptForDevice(type, content, target);
                    return new EncryptedMessage(encryptedContent, target.device);
                });
                await this._storeSessions(encryptionTargets, timestamp);
                return messages;
            } finally {
                for (const target of encryptionTargets) {
                    target.dispose();
                }
            }
        } finally {
            for (const lock of locks) {
                lock.release();
            }
        }
    }
    async _findExistingSessions(devices) {
        const txn = await this._storage.readTxn([this._storage.storeNames.olmSessions]);
        const sessionIdsForDevice = await Promise.all(devices.map(async device => {
            return await txn.olmSessions.getSessionIds(device.curve25519Key);
        }));
        const devicesWithoutSession = devices.filter((_, i) => {
            const sessionIds = sessionIdsForDevice[i];
            return !(sessionIds?.length);
        });
        const existingEncryptionTargets = devices.map((device, i) => {
            const sessionIds = sessionIdsForDevice[i];
            if (sessionIds?.length > 0) {
                const sessionId = findFirstSessionId(sessionIds);
                return EncryptionTarget.fromSessionId(device, sessionId);
            }
        }).filter(target => !!target);
        return {devicesWithoutSession, existingEncryptionTargets};
    }
    _encryptForDevice(type, content, target) {
        const {session, device} = target;
        const plaintext = JSON.stringify(this._buildPlainTextMessageForDevice(type, content, device));
        const message = session.encrypt(plaintext);
        const encryptedContent = {
            algorithm: OLM_ALGORITHM,
            sender_key: this._account.identityKeys.curve25519,
            ciphertext: {
                [device.curve25519Key]: message
            }
        };
        return encryptedContent;
    }
    _buildPlainTextMessageForDevice(type, content, device) {
        return {
            keys: {
                "ed25519": this._account.identityKeys.ed25519
            },
            recipient_keys: {
                "ed25519": device.ed25519Key
            },
            recipient: device.userId,
            sender: this._ownUserId,
            content,
            type
        }
    }
    async _createNewSessions(devicesWithoutSession, hsApi, timestamp) {
        const newEncryptionTargets = await this._claimOneTimeKeys(hsApi, devicesWithoutSession);
        try {
            for (const target of newEncryptionTargets) {
                const {device, oneTimeKey} = target;
                target.session = this._account.createOutboundOlmSession(device.curve25519Key, oneTimeKey);
            }
            this._storeSessions(newEncryptionTargets, timestamp);
        } catch (err) {
            for (const target of newEncryptionTargets) {
                target.dispose();
            }
            throw err;
        }
        return newEncryptionTargets;
    }
    async _claimOneTimeKeys(hsApi, deviceIdentities) {
        const devicesByUser = groupByWithCreator(deviceIdentities,
            device => device.userId,
            () => new Map(),
            (deviceMap, device) => deviceMap.set(device.deviceId, device)
        );
        const oneTimeKeys = Array.from(devicesByUser.entries()).reduce((usersObj, [userId, deviceMap]) => {
            usersObj[userId] = Array.from(deviceMap.values()).reduce((devicesObj, device) => {
                devicesObj[device.deviceId] = OTK_ALGORITHM;
                return devicesObj;
            }, {});
            return usersObj;
        }, {});
        const claimResponse = await hsApi.claimKeys({
            timeout: 10000,
            one_time_keys: oneTimeKeys
        }).response();
        if (Object.keys(claimResponse.failures).length) {
            console.warn("failures for claiming one time keys", oneTimeKeys, claimResponse.failures);
        }
        const userKeyMap = claimResponse?.["one_time_keys"];
        return this._verifyAndCreateOTKTargets(userKeyMap, devicesByUser);
    }
    _verifyAndCreateOTKTargets(userKeyMap, devicesByUser) {
        const verifiedEncryptionTargets = [];
        for (const [userId, userSection] of Object.entries(userKeyMap)) {
            for (const [deviceId, deviceSection] of Object.entries(userSection)) {
                const [firstPropName, keySection] = Object.entries(deviceSection)[0];
                const [keyAlgorithm] = firstPropName.split(":");
                if (keyAlgorithm === OTK_ALGORITHM) {
                    const device = devicesByUser.get(userId)?.get(deviceId);
                    if (device) {
                        const isValidSignature = verifyEd25519Signature(
                            this._olmUtil, userId, deviceId, device.ed25519Key, keySection);
                        if (isValidSignature) {
                            const target = EncryptionTarget.fromOTK(device, keySection.key);
                            verifiedEncryptionTargets.push(target);
                        }
                    }
                }
            }
        }
        return verifiedEncryptionTargets;
    }
    async _loadSessions(encryptionTargets) {
        const txn = await this._storage.readTxn([this._storage.storeNames.olmSessions]);
        let failed = false;
        try {
            await Promise.all(encryptionTargets.map(async encryptionTarget => {
                const sessionEntry = await txn.olmSessions.get(
                    encryptionTarget.device.curve25519Key, encryptionTarget.sessionId);
                if (sessionEntry && !failed) {
                    const olmSession = new this._olm.Session();
                    olmSession.unpickle(this._pickleKey, sessionEntry.session);
                    encryptionTarget.session = olmSession;
                }
            }));
        } catch (err) {
            failed = true;
            for (const target of encryptionTargets) {
                target.dispose();
            }
            throw err;
        }
    }
    async _storeSessions(encryptionTargets, timestamp) {
        const txn = await this._storage.readWriteTxn([this._storage.storeNames.olmSessions]);
        try {
            for (const target of encryptionTargets) {
                const sessionEntry = createSessionEntry(
                    target.session, target.device.curve25519Key, timestamp, this._pickleKey);
                txn.olmSessions.set(sessionEntry);
            }
        } catch (err) {
            txn.abort();
            throw err;
        }
        await txn.complete();
    }
}
class EncryptionTarget {
    constructor(device, oneTimeKey, sessionId) {
        this.device = device;
        this.oneTimeKey = oneTimeKey;
        this.sessionId = sessionId;
        this.session = null;
    }
    static fromOTK(device, oneTimeKey) {
        return new EncryptionTarget(device, oneTimeKey, null);
    }
    static fromSessionId(device, sessionId) {
        return new EncryptionTarget(device, null, sessionId);
    }
    dispose() {
        if (this.session) {
            this.session.free();
        }
    }
}
class EncryptedMessage {
    constructor(content, device) {
        this.content = content;
        this.device = device;
    }
}

class SessionInfo {
    constructor(roomId, senderKey, session, claimedKeys) {
        this.roomId = roomId;
        this.senderKey = senderKey;
        this.session = session;
        this.claimedKeys = claimedKeys;
        this._refCounter = 0;
    }
    retain() {
        this._refCounter += 1;
    }
    release() {
        this._refCounter -= 1;
        if (this._refCounter <= 0) {
            this.dispose();
        }
    }
    dispose() {
        this.session.free();
    }
}

class DecryptionChanges$1 {
    constructor(roomId, results, errors, replayEntries) {
        this._roomId = roomId;
        this._results = results;
        this._errors = errors;
        this._replayEntries = replayEntries;
    }
    async write(txn) {
        await Promise.all(this._replayEntries.map(async replayEntry => {
            try {
                this._handleReplayAttack(this._roomId, replayEntry, txn);
            } catch (err) {
                this._errors.set(replayEntry.eventId, err);
            }
        }));
        return {
            results: this._results,
            errors: this._errors
        };
    }
    async _handleReplayAttack(roomId, replayEntry, txn) {
        const {messageIndex, sessionId, eventId, timestamp} = replayEntry;
        const decryption = await txn.groupSessionDecryptions.get(roomId, sessionId, messageIndex);
        if (decryption && decryption.eventId !== eventId) {
            const decryptedEventIsBad = decryption.timestamp < timestamp;
            const badEventId = decryptedEventIsBad ? eventId : decryption.eventId;
            this._results.delete(eventId);
            throw new DecryptionError("MEGOLM_REPLAYED_INDEX", event, {
                messageIndex,
                badEventId,
                otherEventId: decryption.eventId
            });
        }
        if (!decryption) {
            txn.groupSessionDecryptions.set({
                roomId,
                sessionId,
                messageIndex,
                eventId,
                timestamp
            });
        }
    }
}

function mergeMap(src, dst) {
    if (src) {
        for (const [key, value] of src.entries()) {
            dst.set(key, value);
        }
    }
}

class DecryptionPreparation {
    constructor(roomId, sessionDecryptions, errors) {
        this._roomId = roomId;
        this._sessionDecryptions = sessionDecryptions;
        this._initialErrors = errors;
    }
    async decrypt() {
        try {
            const errors = this._initialErrors;
            const results = new Map();
            const replayEntries = [];
            await Promise.all(this._sessionDecryptions.map(async sessionDecryption => {
                const sessionResult = await sessionDecryption.decryptAll();
                mergeMap(sessionResult.errors, errors);
                mergeMap(sessionResult.results, results);
                replayEntries.push(...sessionResult.replayEntries);
            }));
            return new DecryptionChanges$1(this._roomId, results, errors, replayEntries);
        } finally {
            this.dispose();
        }
    }
    dispose() {
        for (const sd of this._sessionDecryptions) {
            sd.dispose();
        }
    }
}

class ReplayDetectionEntry {
    constructor(sessionId, messageIndex, event) {
        this.sessionId = sessionId;
        this.messageIndex = messageIndex;
        this.eventId = event.event_id;
        this.timestamp = event.origin_server_ts;
    }
}

class SessionDecryption {
    constructor(sessionInfo, events, decryptor) {
        sessionInfo.retain();
        this._sessionInfo = sessionInfo;
        this._events = events;
        this._decryptor = decryptor;
        this._decryptionRequests = decryptor ? [] : null;
    }
    async decryptAll() {
        const replayEntries = [];
        const results = new Map();
        let errors;
        const roomId = this._sessionInfo.roomId;
        await Promise.all(this._events.map(async event => {
            try {
                const {session} = this._sessionInfo;
                const ciphertext = event.content.ciphertext;
                let decryptionResult;
                if (this._decryptor) {
                    const request = this._decryptor.decrypt(session, ciphertext);
                    this._decryptionRequests.push(request);
                    decryptionResult = await request.response();
                } else {
                    decryptionResult = session.decrypt(ciphertext);
                }
                const plaintext = decryptionResult.plaintext;
                const messageIndex = decryptionResult.message_index;
                let payload;
                try {
                    payload = JSON.parse(plaintext);
                } catch (err) {
                    throw new DecryptionError("PLAINTEXT_NOT_JSON", event, {plaintext, err});
                }
                if (payload.room_id !== roomId) {
                    throw new DecryptionError("MEGOLM_WRONG_ROOM", event,
                        {encryptedRoomId: payload.room_id, eventRoomId: roomId});
                }
                replayEntries.push(new ReplayDetectionEntry(session.session_id(), messageIndex, event));
                const result = new DecryptionResult(payload, this._sessionInfo.senderKey, this._sessionInfo.claimedKeys);
                results.set(event.event_id, result);
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }
                if (!errors) {
                    errors = new Map();
                }
                errors.set(event.event_id, err);
            }
        }));
        return {results, errors, replayEntries};
    }
    dispose() {
        if (this._decryptionRequests) {
            for (const r of this._decryptionRequests) {
                r.abort();
            }
        }
        this._sessionInfo.release();
    }
}

const CACHE_MAX_SIZE = 10;
class SessionCache {
    constructor() {
        this._sessions = [];
    }
    get(roomId, senderKey, sessionId) {
        const idx = this._sessions.findIndex(s => {
            return s.roomId === roomId &&
                s.senderKey === senderKey &&
                sessionId === s.session.session_id();
        });
        if (idx !== -1) {
            const sessionInfo = this._sessions[idx];
            if (idx > 0) {
                this._sessions.splice(idx, 1);
                this._sessions.unshift(sessionInfo);
            }
            return sessionInfo;
        }
    }
    add(sessionInfo) {
        sessionInfo.retain();
        this._sessions.unshift(sessionInfo);
        if (this._sessions.length > CACHE_MAX_SIZE) {
            for (let i = CACHE_MAX_SIZE; i < this._sessions.length; i += 1) {
                this._sessions[i].release();
            }
            this._sessions = this._sessions.slice(0, CACHE_MAX_SIZE);
        }
    }
    dispose() {
        for (const sessionInfo of this._sessions) {
            sessionInfo.release();
        }
    }
}

class DecryptionWorker {
    constructor(workerPool) {
        this._workerPool = workerPool;
    }
    decrypt(session, ciphertext) {
        const sessionKey = session.export_session(session.first_known_index());
        return this._workerPool.send({type: "megolm_decrypt", ciphertext, sessionKey});
    }
}

function getSenderKey(event) {
    return event.content?.["sender_key"];
}
function getSessionId(event) {
    return event.content?.["session_id"];
}
function getCiphertext(event) {
    return event.content?.ciphertext;
}
class Decryption$1 {
    constructor({pickleKey, olm, workerPool}) {
        this._pickleKey = pickleKey;
        this._olm = olm;
        this._decryptor = workerPool ? new DecryptionWorker(workerPool) : null;
    }
    createSessionCache(fallback) {
        return new SessionCache(fallback);
    }
    async prepareDecryptAll(roomId, events, sessionCache, txn) {
        const errors = new Map();
        const validEvents = [];
        for (const event of events) {
            const isValid = typeof getSenderKey(event) === "string" &&
                            typeof getSessionId(event) === "string" &&
                            typeof getCiphertext(event) === "string";
            if (isValid) {
                validEvents.push(event);
            } else {
                errors.set(event.event_id, new DecryptionError("MEGOLM_INVALID_EVENT", event));
            }
        }
        const eventsBySession = groupBy(validEvents, event => {
            return `${getSenderKey(event)}|${getSessionId(event)}`;
        });
        const sessionDecryptions = [];
        await Promise.all(Array.from(eventsBySession.values()).map(async eventsForSession => {
            const first = eventsForSession[0];
            const senderKey = getSenderKey(first);
            const sessionId = getSessionId(first);
            const sessionInfo = await this._getSessionInfo(roomId, senderKey, sessionId, sessionCache, txn);
            if (!sessionInfo) {
                for (const event of eventsForSession) {
                    errors.set(event.event_id, new DecryptionError("MEGOLM_NO_SESSION", event));
                }
            } else {
                sessionDecryptions.push(new SessionDecryption(sessionInfo, eventsForSession, this._decryptor));
            }
        }));
        return new DecryptionPreparation(roomId, sessionDecryptions, errors);
    }
    async _getSessionInfo(roomId, senderKey, sessionId, sessionCache, txn) {
        let sessionInfo;
        sessionInfo = sessionCache.get(roomId, senderKey, sessionId);
        if (!sessionInfo) {
            const sessionEntry = await txn.inboundGroupSessions.get(roomId, senderKey, sessionId);
            if (sessionEntry) {
                let session = new this._olm.InboundGroupSession();
                try {
                    session.unpickle(this._pickleKey, sessionEntry.session);
                    sessionInfo = new SessionInfo(roomId, senderKey, session, sessionEntry.claimedKeys);
                } catch (err) {
                    session.free();
                    throw err;
                }
                sessionCache.add(sessionInfo);
            }
        }
        return sessionInfo;
    }
    async addRoomKeys(decryptionResults, txn) {
        const newSessions = [];
        for (const {senderCurve25519Key: senderKey, event, claimedEd25519Key} of decryptionResults) {
            const roomId = event.content?.["room_id"];
            const sessionId = event.content?.["session_id"];
            const sessionKey = event.content?.["session_key"];
            if (
                typeof roomId !== "string" ||
                typeof sessionId !== "string" ||
                typeof senderKey !== "string" ||
                typeof sessionKey !== "string"
            ) {
                return;
            }
            const hasSession = await txn.inboundGroupSessions.has(roomId, senderKey, sessionId);
            if (!hasSession) {
                const session = new this._olm.InboundGroupSession();
                try {
                    session.create(sessionKey);
                    const sessionEntry = {
                        roomId,
                        senderKey,
                        sessionId,
                        session: session.pickle(this._pickleKey),
                        claimedKeys: {ed25519: claimedEd25519Key},
                    };
                    txn.inboundGroupSessions.set(sessionEntry);
                    newSessions.push(sessionEntry);
                } finally {
                    session.free();
                }
            }
        }
        return newSessions;
    }
}

class Encryption$1 {
    constructor({pickleKey, olm, account, storage, now, ownDeviceId}) {
        this._pickleKey = pickleKey;
        this._olm = olm;
        this._account = account;
        this._storage = storage;
        this._now = now;
        this._ownDeviceId = ownDeviceId;
    }
    discardOutboundSession(roomId, txn) {
        txn.outboundGroupSessions.remove(roomId);
    }
    async createRoomKeyMessage(roomId, txn) {
        let sessionEntry = await txn.outboundGroupSessions.get(roomId);
        if (sessionEntry) {
            const session = new this._olm.OutboundGroupSession();
            try {
                session.unpickle(this._pickleKey, sessionEntry.session);
                return this._createRoomKeyMessage(session, roomId);
            } finally {
                session.free();
            }
        }
    }
    async encrypt(roomId, type, content, encryptionParams) {
        let session = new this._olm.OutboundGroupSession();
        try {
            const txn = await this._storage.readWriteTxn([
                this._storage.storeNames.inboundGroupSessions,
                this._storage.storeNames.outboundGroupSessions,
            ]);
            let roomKeyMessage;
            let encryptedContent;
            try {
                let sessionEntry = await txn.outboundGroupSessions.get(roomId);
                if (sessionEntry) {
                    session.unpickle(this._pickleKey, sessionEntry.session);
                }
                if (!sessionEntry || this._needsToRotate(session, sessionEntry.createdAt, encryptionParams)) {
                    if (sessionEntry) {
                        session.free();
                        session = new this._olm.OutboundGroupSession();
                    }
                    session.create();
                    roomKeyMessage = this._createRoomKeyMessage(session, roomId);
                    this._storeAsInboundSession(session, roomId, txn);
                }
                encryptedContent = this._encryptContent(roomId, session, type, content);
                txn.outboundGroupSessions.set({
                    roomId,
                    session: session.pickle(this._pickleKey),
                    createdAt: sessionEntry?.createdAt || this._now(),
                });
            } catch (err) {
                txn.abort();
                throw err;
            }
            await txn.complete();
            return new EncryptionResult(encryptedContent, roomKeyMessage);
        } finally {
            if (session) {
                session.free();
            }
        }
    }
    _needsToRotate(session, createdAt, encryptionParams) {
        let rotationPeriodMs = 604800000;
        if (Number.isSafeInteger(encryptionParams?.rotation_period_ms)) {
            rotationPeriodMs = encryptionParams?.rotation_period_ms;
        }
        let rotationPeriodMsgs = 100;
        if (Number.isSafeInteger(encryptionParams?.rotation_period_msgs)) {
            rotationPeriodMsgs = encryptionParams?.rotation_period_msgs;
        }
        if (this._now() > (createdAt + rotationPeriodMs)) {
            return true;
        }
        if (session.message_index() >= rotationPeriodMsgs) {
            return true;
        }
    }
    _encryptContent(roomId, session, type, content) {
        const plaintext = JSON.stringify({
            room_id: roomId,
            type,
            content
        });
        const ciphertext = session.encrypt(plaintext);
        const encryptedContent = {
            algorithm: MEGOLM_ALGORITHM,
            sender_key: this._account.identityKeys.curve25519,
            ciphertext,
            session_id: session.session_id(),
            device_id: this._ownDeviceId
        };
        return encryptedContent;
    }
    _createRoomKeyMessage(session, roomId) {
        return {
            room_id: roomId,
            session_id: session.session_id(),
            session_key: session.session_key(),
            algorithm: MEGOLM_ALGORITHM,
            chain_index: session.message_index()
        }
    }
    _storeAsInboundSession(outboundSession, roomId, txn) {
        const {identityKeys} = this._account;
        const claimedKeys = {ed25519: identityKeys.ed25519};
        const session = new this._olm.InboundGroupSession();
        try {
            session.create(outboundSession.session_key());
            const sessionEntry = {
                roomId,
                senderKey: identityKeys.curve25519,
                sessionId: session.session_id(),
                session: session.pickle(this._pickleKey),
                claimedKeys,
            };
            txn.inboundGroupSessions.set(sessionEntry);
            return sessionEntry;
        } finally {
            session.free();
        }
    }
}
class EncryptionResult {
    constructor(content, roomKeyMessage) {
        this.content = content;
        this.roomKeyMessage = roomKeyMessage;
    }
}

const ENCRYPTED_TYPE = "m.room.encrypted";
class RoomEncryption {
    constructor({room, deviceTracker, olmEncryption, megolmEncryption, megolmDecryption, encryptionParams, storage}) {
        this._room = room;
        this._deviceTracker = deviceTracker;
        this._olmEncryption = olmEncryption;
        this._megolmEncryption = megolmEncryption;
        this._megolmDecryption = megolmDecryption;
        this._encryptionParams = encryptionParams;
        this._megolmBackfillCache = this._megolmDecryption.createSessionCache();
        this._megolmSyncCache = this._megolmDecryption.createSessionCache();
        this._eventIdsByMissingSession = new Map();
        this._senderDeviceCache = new Map();
        this._storage = storage;
    }
    notifyTimelineClosed() {
        this._megolmBackfillCache.dispose();
        this._megolmBackfillCache = this._megolmDecryption.createSessionCache();
        this._senderDeviceCache = new Map();
    }
    async writeMemberChanges(memberChanges, txn) {
        for (const m of memberChanges.values()) {
            if (m.hasLeft) {
                this._megolmEncryption.discardOutboundSession(this._room.id, txn);
                break;
            }
        }
        return await this._deviceTracker.writeMemberChanges(this._room, memberChanges, txn);
    }
    async prepareDecryptAll(events, source, isTimelineOpen, txn) {
        const errors = [];
        const validEvents = [];
        for (const event of events) {
            if (event.redacted_because || event.unsigned?.redacted_because) {
                continue;
            }
            if (event.content?.algorithm !== MEGOLM_ALGORITHM) {
                errors.set(event.event_id, new Error("Unsupported algorithm: " + event.content?.algorithm));
            }
            validEvents.push(event);
        }
        let customCache;
        let sessionCache;
        if (source === DecryptionSource.Sync) {
            sessionCache = this._megolmSyncCache;
        } else if (source === DecryptionSource.Timeline) {
            sessionCache = this._megolmBackfillCache;
        } else if (source === DecryptionSource.Retry) {
            customCache = this._megolmEncryption.createSessionCache();
            sessionCache = customCache;
        } else {
            throw new Error("Unknown source: " + source);
        }
        const preparation = await this._megolmDecryption.prepareDecryptAll(
            this._room.id, validEvents, sessionCache, txn);
        if (customCache) {
            customCache.dispose();
        }
        return new DecryptionPreparation$1(preparation, errors, {isTimelineOpen}, this);
    }
    async _processDecryptionResults(results, errors, flags, txn) {
        for (const error of errors.values()) {
            if (error.code === "MEGOLM_NO_SESSION") {
                this._addMissingSessionEvent(error.event);
            }
        }
        if (flags.isTimelineOpen) {
            for (const result of results.values()) {
                await this._verifyDecryptionResult(result, txn);
            }
        }
    }
    async _verifyDecryptionResult(result, txn) {
        let device = this._senderDeviceCache.get(result.senderCurve25519Key);
        if (!device) {
            device = await this._deviceTracker.getDeviceByCurve25519Key(result.senderCurve25519Key, txn);
            this._senderDeviceCache.set(result.senderCurve25519Key, device);
        }
        if (device) {
            result.setDevice(device);
        } else if (!this._room.isTrackingMembers) {
            result.setRoomNotTrackedYet();
        }
    }
    _addMissingSessionEvent(event) {
        const senderKey = event.content?.["sender_key"];
        const sessionId = event.content?.["session_id"];
        const key = `${senderKey}|${sessionId}`;
        let eventIds = this._eventIdsByMissingSession.get(key);
        if (!eventIds) {
            eventIds = new Set();
            this._eventIdsByMissingSession.set(key, eventIds);
        }
        eventIds.add(event.event_id);
    }
    applyRoomKeys(roomKeys) {
        const retryEventIds = [];
        for (const roomKey of roomKeys) {
            const key = `${roomKey.senderKey}|${roomKey.sessionId}`;
            const entriesForSession = this._eventIdsByMissingSession.get(key);
            if (entriesForSession) {
                this._eventIdsByMissingSession.delete(key);
                retryEventIds.push(...entriesForSession);
            }
        }
        return retryEventIds;
    }
    async encrypt(type, content, hsApi) {
        const megolmResult = await this._megolmEncryption.encrypt(this._room.id, type, content, this._encryptionParams);
        if (megolmResult.roomKeyMessage) {
            await this._deviceTracker.trackRoom(this._room);
            const devices = await this._deviceTracker.devicesForTrackedRoom(this._room.id, hsApi);
            await this._sendRoomKey(megolmResult.roomKeyMessage, devices, hsApi);
            const userIds = Array.from(devices.reduce((set, device) => set.add(device.userId), new Set()));
            await this._clearNeedsRoomKeyFlag(userIds);
        }
        return {
            type: ENCRYPTED_TYPE,
            content: megolmResult.content
        };
    }
    needsToShareKeys(memberChanges) {
        for (const m of memberChanges.values()) {
            if (m.member.needsRoomKey) {
                return true;
            }
        }
        return false;
    }
    async shareRoomKeyToPendingMembers(hsApi) {
        const txn = await this._storage.readTxn([this._storage.storeNames.roomMembers]);
        const pendingUserIds = await txn.roomMembers.getUserIdsNeedingRoomKey(this._room.id);
        return await this._shareRoomKey(pendingUserIds, hsApi);
    }
    async shareRoomKeyForMemberChanges(memberChanges, hsApi) {
        const pendingUserIds = [];
        for (const m of memberChanges.values()) {
            if (m.member.needsRoomKey) {
                pendingUserIds.push(m.userId);
            }
        }
        return await this._shareRoomKey(pendingUserIds, hsApi);
    }
    async _shareRoomKey(userIds, hsApi) {
        if (userIds.length === 0) {
            return;
        }
        const readRoomKeyTxn = await this._storage.readTxn([this._storage.storeNames.outboundGroupSessions]);
        const roomKeyMessage = await this._megolmEncryption.createRoomKeyMessage(this._room.id, readRoomKeyTxn);
        if (roomKeyMessage) {
            const devices = await this._deviceTracker.devicesForRoomMembers(this._room.id, userIds, hsApi);
            await this._sendRoomKey(roomKeyMessage, devices, hsApi);
            const actuallySentUserIds = Array.from(devices.reduce((set, device) => set.add(device.userId), new Set()));
            await this._clearNeedsRoomKeyFlag(actuallySentUserIds);
        } else {
            await this._clearNeedsRoomKeyFlag(userIds);
        }
    }
    async _clearNeedsRoomKeyFlag(userIds) {
        const txn = await this._storage.readWriteTxn([this._storage.storeNames.roomMembers]);
        try {
            await Promise.all(userIds.map(async userId => {
                const memberData = await txn.roomMembers.get(this._room.id, userId);
                if (memberData.needsRoomKey) {
                    memberData.needsRoomKey = false;
                    txn.roomMembers.set(memberData);
                }
            }));
        } catch (err) {
            txn.abort();
            throw err;
        }
        await txn.complete();
    }
    async _sendRoomKey(roomKeyMessage, devices, hsApi) {
        const messages = await this._olmEncryption.encrypt(
            "m.room_key", roomKeyMessage, devices, hsApi);
        await this._sendMessagesToDevices(ENCRYPTED_TYPE, messages, hsApi);
    }
    async _sendMessagesToDevices(type, messages, hsApi) {
        const messagesByUser = groupBy(messages, message => message.device.userId);
        const payload = {
            messages: Array.from(messagesByUser.entries()).reduce((userMap, [userId, messages]) => {
                userMap[userId] = messages.reduce((deviceMap, message) => {
                    deviceMap[message.device.deviceId] = message.content;
                    return deviceMap;
                }, {});
                return userMap;
            }, {})
        };
        const txnId = makeTxnId();
        await hsApi.sendToDevice(type, payload, txnId).response();
    }
}
class DecryptionPreparation$1 {
    constructor(megolmDecryptionPreparation, extraErrors, flags, roomEncryption) {
        this._megolmDecryptionPreparation = megolmDecryptionPreparation;
        this._extraErrors = extraErrors;
        this._flags = flags;
        this._roomEncryption = roomEncryption;
    }
    async decrypt() {
        return new DecryptionChanges$2(
            await this._megolmDecryptionPreparation.decrypt(),
            this._extraErrors,
            this._flags,
            this._roomEncryption);
    }
    dispose() {
        this._megolmDecryptionPreparation.dispose();
    }
}
class DecryptionChanges$2 {
    constructor(megolmDecryptionChanges, extraErrors, flags, roomEncryption) {
        this._megolmDecryptionChanges = megolmDecryptionChanges;
        this._extraErrors = extraErrors;
        this._flags = flags;
        this._roomEncryption = roomEncryption;
    }
    async write(txn) {
        const {results, errors} = await this._megolmDecryptionChanges.write(txn);
        mergeMap(this._extraErrors, errors);
        await this._roomEncryption._processDecryptionResults(results, errors, this._flags, txn);
        return new BatchDecryptionResult(results, errors);
    }
}
class BatchDecryptionResult {
    constructor(results, errors) {
        this.results = results;
        this.errors = errors;
    }
    applyToEntries(entries) {
        for (const entry of entries) {
            const result = this.results.get(entry.id);
            if (result) {
                entry.setDecryptionResult(result);
            } else {
                const error = this.errors.get(entry.id);
                if (error) {
                    entry.setDecryptionError(error);
                }
            }
        }
    }
}

const TRACKING_STATUS_OUTDATED = 0;
const TRACKING_STATUS_UPTODATE = 1;
function deviceKeysAsDeviceIdentity(deviceSection) {
    const deviceId = deviceSection["device_id"];
    const userId = deviceSection["user_id"];
    return {
        userId,
        deviceId,
        ed25519Key: deviceSection.keys[`ed25519:${deviceId}`],
        curve25519Key: deviceSection.keys[`curve25519:${deviceId}`],
        algorithms: deviceSection.algorithms,
        displayName: deviceSection.unsigned?.device_display_name,
    };
}
class DeviceTracker {
    constructor({storage, getSyncToken, olmUtil, ownUserId, ownDeviceId}) {
        this._storage = storage;
        this._getSyncToken = getSyncToken;
        this._identityChangedForRoom = null;
        this._olmUtil = olmUtil;
        this._ownUserId = ownUserId;
        this._ownDeviceId = ownDeviceId;
    }
    async writeDeviceChanges(deviceLists, txn) {
        const {userIdentities} = txn;
        if (Array.isArray(deviceLists.changed) && deviceLists.changed.length) {
            await Promise.all(deviceLists.changed.map(async userId => {
                const user = await userIdentities.get(userId);
                if (user) {
                    user.deviceTrackingStatus = TRACKING_STATUS_OUTDATED;
                    userIdentities.set(user);
                }
            }));
        }
    }
    writeMemberChanges(room, memberChanges, txn) {
        return Promise.all(Array.from(memberChanges.values()).map(async memberChange => {
            return this._applyMemberChange(memberChange, txn);
        }));
    }
    async trackRoom(room) {
        if (room.isTrackingMembers || !room.isEncrypted) {
            return;
        }
        const memberList = await room.loadMemberList();
        try {
            const txn = await this._storage.readWriteTxn([
                this._storage.storeNames.roomSummary,
                this._storage.storeNames.userIdentities,
            ]);
            let isTrackingChanges;
            try {
                isTrackingChanges = room.writeIsTrackingMembers(true, txn);
                const members = Array.from(memberList.members.values());
                await this._writeJoinedMembers(members, txn);
            } catch (err) {
                txn.abort();
                throw err;
            }
            await txn.complete();
            room.applyIsTrackingMembersChanges(isTrackingChanges);
        } finally {
            memberList.release();
        }
    }
    async _writeJoinedMembers(members, txn) {
        await Promise.all(members.map(async member => {
            if (member.membership === "join") {
                await this._writeMember(member, txn);
            }
        }));
    }
    async _writeMember(member, txn) {
        const {userIdentities} = txn;
        const identity = await userIdentities.get(member.userId);
        if (!identity) {
            userIdentities.set({
                userId: member.userId,
                roomIds: [member.roomId],
                deviceTrackingStatus: TRACKING_STATUS_OUTDATED,
            });
        } else {
            if (!identity.roomIds.includes(member.roomId)) {
                identity.roomIds.push(member.roomId);
                userIdentities.set(identity);
            }
        }
    }
    async _applyMemberChange(memberChange, txn) {
        if (memberChange.previousMembership !== "join" && memberChange.membership === "join") {
            await this._writeMember(memberChange.member, txn);
        }
        else if (memberChange.previousMembership === "join" && memberChange.membership !== "join") {
            const {userIdentities} = txn;
            const identity = await userIdentities.get(memberChange.userId);
            if (identity) {
                identity.roomIds = identity.roomIds.filter(roomId => roomId !== memberChange.roomId);
                if (identity.roomIds.length === 0) {
                    userIdentities.remove(identity.userId);
                } else {
                    userIdentities.set(identity);
                }
            }
        }
    }
    async _queryKeys(userIds, hsApi) {
        const deviceKeyResponse = await hsApi.queryKeys({
            "timeout": 10000,
            "device_keys": userIds.reduce((deviceKeysMap, userId) => {
                deviceKeysMap[userId] = [];
                return deviceKeysMap;
            }, {}),
            "token": this._getSyncToken()
        }).response();
        const verifiedKeysPerUser = this._filterVerifiedDeviceKeys(deviceKeyResponse["device_keys"]);
        const flattenedVerifiedKeysPerUser = verifiedKeysPerUser.reduce((all, {verifiedKeys}) => all.concat(verifiedKeys), []);
        const deviceIdentitiesWithPossibleChangedKeys = flattenedVerifiedKeysPerUser.map(deviceKeysAsDeviceIdentity);
        const txn = await this._storage.readWriteTxn([
            this._storage.storeNames.userIdentities,
            this._storage.storeNames.deviceIdentities,
        ]);
        let deviceIdentities;
        try {
            deviceIdentities = await Promise.all(deviceIdentitiesWithPossibleChangedKeys.map(async (deviceIdentity) => {
                const existingDevice = await txn.deviceIdentities.get(deviceIdentity.userId, deviceIdentity.deviceId);
                if (!existingDevice || existingDevice.ed25519Key === deviceIdentity.ed25519Key) {
                    return deviceIdentity;
                }
                return null;
            }));
            deviceIdentities = deviceIdentities.filter(di => !!di);
            for (const deviceIdentity of deviceIdentities) {
                txn.deviceIdentities.set(deviceIdentity);
            }
            await Promise.all(verifiedKeysPerUser.map(async ({userId}) => {
                const identity = await txn.userIdentities.get(userId);
                identity.deviceTrackingStatus = TRACKING_STATUS_UPTODATE;
                txn.userIdentities.set(identity);
            }));
        } catch (err) {
            txn.abort();
            throw err;
        }
        await txn.complete();
        return deviceIdentities;
    }
    _filterVerifiedDeviceKeys(keyQueryDeviceKeysResponse) {
        const curve25519Keys = new Set();
        const verifiedKeys = Object.entries(keyQueryDeviceKeysResponse).map(([userId, keysByDevice]) => {
            const verifiedEntries = Object.entries(keysByDevice).filter(([deviceId, deviceKeys]) => {
                const deviceIdOnKeys = deviceKeys["device_id"];
                const userIdOnKeys = deviceKeys["user_id"];
                if (userIdOnKeys !== userId) {
                    return false;
                }
                if (deviceIdOnKeys !== deviceId) {
                    return false;
                }
                const ed25519Key = deviceKeys.keys?.[`ed25519:${deviceId}`];
                const curve25519Key = deviceKeys.keys?.[`curve25519:${deviceId}`];
                if (typeof ed25519Key !== "string" || typeof curve25519Key !== "string") {
                    return false;
                }
                if (curve25519Keys.has(curve25519Key)) {
                    console.warn("ignoring device with duplicate curve25519 key in /keys/query response", deviceKeys);
                    return false;
                }
                curve25519Keys.add(curve25519Key);
                return this._hasValidSignature(deviceKeys);
            });
            const verifiedKeys = verifiedEntries.map(([, deviceKeys]) => deviceKeys);
            return {userId, verifiedKeys};
        });
        return verifiedKeys;
    }
    _hasValidSignature(deviceSection) {
        const deviceId = deviceSection["device_id"];
        const userId = deviceSection["user_id"];
        const ed25519Key = deviceSection?.keys?.[`${SIGNATURE_ALGORITHM}:${deviceId}`];
        return verifyEd25519Signature(this._olmUtil, userId, deviceId, ed25519Key, deviceSection);
    }
    async devicesForTrackedRoom(roomId, hsApi) {
        const txn = await this._storage.readTxn([
            this._storage.storeNames.roomMembers,
            this._storage.storeNames.userIdentities,
        ]);
        const userIds = await txn.roomMembers.getAllUserIds(roomId);
        return await this._devicesForUserIds(roomId, userIds, txn, hsApi);
    }
    async devicesForRoomMembers(roomId, userIds, hsApi) {
        const txn = await this._storage.readTxn([
            this._storage.storeNames.userIdentities,
        ]);
        return await this._devicesForUserIds(roomId, userIds, txn, hsApi);
    }
    async _devicesForUserIds(roomId, userIds, userIdentityTxn, hsApi) {
        const allMemberIdentities = await Promise.all(userIds.map(userId => userIdentityTxn.userIdentities.get(userId)));
        const identities = allMemberIdentities.filter(identity => {
            return identity && identity.roomIds.includes(roomId);
        });
        const upToDateIdentities = identities.filter(i => i.deviceTrackingStatus === TRACKING_STATUS_UPTODATE);
        const outdatedIdentities = identities.filter(i => i.deviceTrackingStatus === TRACKING_STATUS_OUTDATED);
        let queriedDevices;
        if (outdatedIdentities.length) {
            queriedDevices = await this._queryKeys(outdatedIdentities.map(i => i.userId), hsApi);
        }
        const deviceTxn = await this._storage.readTxn([
            this._storage.storeNames.deviceIdentities,
        ]);
        const devicesPerUser = await Promise.all(upToDateIdentities.map(identity => {
            return deviceTxn.deviceIdentities.getAllForUserId(identity.userId);
        }));
        let flattenedDevices = devicesPerUser.reduce((all, devicesForUser) => all.concat(devicesForUser), []);
        if (queriedDevices && queriedDevices.length) {
            flattenedDevices = flattenedDevices.concat(queriedDevices);
        }
        const devices = flattenedDevices.filter(device => {
            const isOwnDevice = device.userId === this._ownUserId && device.deviceId === this._ownDeviceId;
            return !isOwnDevice;
        });
        return devices;
    }
    async getDeviceByCurve25519Key(curve25519Key, txn) {
        return await txn.deviceIdentities.getByCurve25519Key(curve25519Key);
    }
}

class Lock {
    constructor() {
        this._promise = null;
        this._resolve = null;
    }
    take() {
        if (!this._promise) {
            this._promise = new Promise(resolve => {
                this._resolve = resolve;
            });
            return true;
        }
        return false;
    }
    get isTaken() {
        return !!this._promise;
    }
    release() {
        if (this._resolve) {
            this._promise = null;
            const resolve = this._resolve;
            this._resolve = null;
            resolve();
        }
    }
    released() {
        return this._promise;
    }
}

class LockMap {
    constructor() {
        this._map = new Map();
    }
    async takeLock(key) {
        let lock = this._map.get(key);
        if (lock) {
            while (!lock.take()) {
                await lock.released();
            }
        } else {
            lock = new Lock();
            lock.take();
            this._map.set(key, lock);
        }
        lock.released().then(() => {
            Promise.resolve().then(() => {
                if (!lock.isTaken) {
                    this._map.delete(key);
                }
            });
        });
        return lock;
    }
}

const PICKLE_KEY = "DEFAULT_KEY";
class Session$1 {
    constructor({clock, storage, hsApi, sessionInfo, olm, workerPool}) {
        this._clock = clock;
        this._storage = storage;
        this._hsApi = hsApi;
        this._syncInfo = null;
        this._sessionInfo = sessionInfo;
        this._rooms = new ObservableMap();
        this._sendScheduler = new SendScheduler({hsApi, backoff: new RateLimitingBackoff()});
        this._roomUpdateCallback = (room, params) => this._rooms.update(room.id, params);
        this._user = new User(sessionInfo.userId);
        this._deviceMessageHandler = new DeviceMessageHandler({storage});
        this._olm = olm;
        this._olmUtil = null;
        this._e2eeAccount = null;
        this._deviceTracker = null;
        this._olmEncryption = null;
        this._megolmEncryption = null;
        this._megolmDecryption = null;
        this._getSyncToken = () => this.syncToken;
        this._workerPool = workerPool;
        if (olm) {
            this._olmUtil = new olm.Utility();
            this._deviceTracker = new DeviceTracker({
                storage,
                getSyncToken: this._getSyncToken,
                olmUtil: this._olmUtil,
                ownUserId: sessionInfo.userId,
                ownDeviceId: sessionInfo.deviceId,
            });
        }
        this._createRoomEncryption = this._createRoomEncryption.bind(this);
    }
    _setupEncryption() {
        console.log("loaded e2ee account with keys", this._e2eeAccount.identityKeys);
        const senderKeyLock = new LockMap();
        const olmDecryption = new Decryption({
            account: this._e2eeAccount,
            pickleKey: PICKLE_KEY,
            olm: this._olm,
            storage: this._storage,
            now: this._clock.now,
            ownUserId: this._user.id,
            senderKeyLock
        });
        this._olmEncryption = new Encryption({
            account: this._e2eeAccount,
            pickleKey: PICKLE_KEY,
            olm: this._olm,
            storage: this._storage,
            now: this._clock.now,
            ownUserId: this._user.id,
            olmUtil: this._olmUtil,
            senderKeyLock
        });
        this._megolmEncryption = new Encryption$1({
            account: this._e2eeAccount,
            pickleKey: PICKLE_KEY,
            olm: this._olm,
            storage: this._storage,
            now: this._clock.now,
            ownDeviceId: this._sessionInfo.deviceId,
        });
        this._megolmDecryption = new Decryption$1({
            pickleKey: PICKLE_KEY,
            olm: this._olm,
            workerPool: this._workerPool,
        });
        this._deviceMessageHandler.enableEncryption({olmDecryption, megolmDecryption: this._megolmDecryption});
    }
    _createRoomEncryption(room, encryptionParams) {
        if (!this._olmEncryption) {
            throw new Error("creating room encryption before encryption got globally enabled");
        }
        if (encryptionParams.algorithm !== MEGOLM_ALGORITHM) {
            return null;
        }
        return new RoomEncryption({
            room,
            deviceTracker: this._deviceTracker,
            olmEncryption: this._olmEncryption,
            megolmEncryption: this._megolmEncryption,
            megolmDecryption: this._megolmDecryption,
            storage: this._storage,
            encryptionParams
        });
    }
    async beforeFirstSync(isNewLogin) {
        if (this._olm) {
            if (isNewLogin && this._e2eeAccount) {
                throw new Error("there should not be an e2ee account already on a fresh login");
            }
            if (!this._e2eeAccount) {
                const txn = await this._storage.readWriteTxn([
                    this._storage.storeNames.session
                ]);
                try {
                    this._e2eeAccount = await Account.create({
                        hsApi: this._hsApi,
                        olm: this._olm,
                        pickleKey: PICKLE_KEY,
                        userId: this._sessionInfo.userId,
                        deviceId: this._sessionInfo.deviceId,
                        txn
                    });
                } catch (err) {
                    txn.abort();
                    throw err;
                }
                await txn.complete();
                this._setupEncryption();
            }
            await this._e2eeAccount.generateOTKsIfNeeded(this._storage);
            await this._e2eeAccount.uploadKeys(this._storage);
            await this._deviceMessageHandler.decryptPending(this.rooms);
        }
    }
    async load() {
        const txn = await this._storage.readTxn([
            this._storage.storeNames.session,
            this._storage.storeNames.roomSummary,
            this._storage.storeNames.roomMembers,
            this._storage.storeNames.timelineEvents,
            this._storage.storeNames.timelineFragments,
            this._storage.storeNames.pendingEvents,
        ]);
        this._syncInfo = await txn.session.get("sync");
        if (this._olm) {
            this._e2eeAccount = await Account.load({
                hsApi: this._hsApi,
                olm: this._olm,
                pickleKey: PICKLE_KEY,
                userId: this._sessionInfo.userId,
                deviceId: this._sessionInfo.deviceId,
                txn
            });
            if (this._e2eeAccount) {
                this._setupEncryption();
            }
        }
        const pendingEventsByRoomId = await this._getPendingEventsByRoom(txn);
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
        this._workerPool?.dispose();
        this._sendScheduler.stop();
    }
    async start(lastVersionResponse) {
        if (lastVersionResponse) {
            const txn = await this._storage.readWriteTxn([
                this._storage.storeNames.session
            ]);
            txn.session.set("serverVersions", lastVersionResponse);
            await txn.complete();
        }
        this._sendScheduler.start();
        for (const [, room] of this._rooms) {
            room.start();
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
            getSyncToken: this._getSyncToken,
            storage: this._storage,
            emitCollectionChange: this._roomUpdateCallback,
            hsApi: this._hsApi,
            sendScheduler: this._sendScheduler,
            pendingEvents,
            user: this._user,
            createRoomEncryption: this._createRoomEncryption
        });
        this._rooms.add(roomId, room);
        return room;
    }
    async writeSync(syncResponse, syncFilterId, txn) {
        const changes = {};
        const syncToken = syncResponse.next_batch;
        const deviceOneTimeKeysCount = syncResponse.device_one_time_keys_count;
        if (this._e2eeAccount && deviceOneTimeKeysCount) {
            changes.e2eeAccountChanges = this._e2eeAccount.writeSync(deviceOneTimeKeysCount, txn);
        }
        if (syncToken !== this.syncToken) {
            const syncInfo = {token: syncToken, filterId: syncFilterId};
            txn.session.set("sync", syncInfo);
            changes.syncInfo = syncInfo;
        }
        if (this._deviceTracker) {
            const deviceLists = syncResponse.device_lists;
            if (deviceLists) {
                await this._deviceTracker.writeDeviceChanges(deviceLists, txn);
            }
        }
        const toDeviceEvents = syncResponse.to_device?.events;
        if (Array.isArray(toDeviceEvents)) {
            this._deviceMessageHandler.writeSync(toDeviceEvents, txn);
        }
        return changes;
    }
    afterSync({syncInfo, e2eeAccountChanges}) {
        if (syncInfo) {
            this._syncInfo = syncInfo;
        }
        if (this._e2eeAccount && e2eeAccountChanges) {
            this._e2eeAccount.afterSync(e2eeAccountChanges);
        }
    }
    async afterSyncCompleted() {
        const needsToUploadOTKs = await this._e2eeAccount.generateOTKsIfNeeded(this._storage);
        const promises = [this._deviceMessageHandler.decryptPending(this.rooms)];
        if (needsToUploadOTKs) {
            promises.push(this._e2eeAccount.uploadKeys(this._storage));
        }
        await Promise.all(promises);
    }
    get syncToken() {
        return this._syncInfo?.token;
    }
    get syncFilterId() {
        return this._syncInfo?.filterId;
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
    "SessionSetup",
    "Migrating",
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
    constructor({clock, random, onlineStatus, request, storageFactory, sessionInfoStorage, olmPromise, workerPromise}) {
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
        this._olmPromise = olmPromise;
        this._workerPromise = workerPromise;
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
            await this._loadSessionInfo(sessionInfo, false);
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
            const loginData = await hsApi.passwordLogin(username, password, "Hydrogen").response();
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
                this._status.set(LoadStatus.LoginFailed);
            } else {
                this._status.set(LoadStatus.Error);
            }
            return;
        }
        try {
            await this._loadSessionInfo(sessionInfo, true);
        } catch (err) {
            this._error = err;
            this._status.set(LoadStatus.Error);
        }
    }
    async _loadSessionInfo(sessionInfo, isNewLogin) {
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
        const filteredSessionInfo = {
            deviceId: sessionInfo.deviceId,
            userId: sessionInfo.userId,
            homeServer: sessionInfo.homeServer,
        };
        const olm = await this._olmPromise;
        let workerPool = null;
        if (this._workerPromise) {
            workerPool = await this._workerPromise;
        }
        this._session = new Session$1({storage: this._storage,
            sessionInfo: filteredSessionInfo, hsApi, olm,
            clock: this._clock, workerPool});
        await this._session.load();
        this._status.set(LoadStatus.SessionSetup);
        await this._session.beforeFirstSync(isNewLogin);
        this._sync = new Sync({hsApi, storage: this._storage, session: this._session});
        this._reconnectSubscription = this._reconnector.connectionStatus.subscribe(state => {
            if (state === ConnectionStatus.Online) {
                this._sync.start();
                this._session.start(this._reconnector.lastVersionsResponse);
            }
        });
        await this._waitForFirstSync();
        this._status.set(LoadStatus.Ready);
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
            if (!(err instanceof ConnectionError)) {
                throw err;
            }
        }
        this._waitForFirstSyncHandle = this._sync.status.waitFor(s => s === SyncStatus.Syncing || s === SyncStatus.Stopped);
        try {
            await this._waitForFirstSyncHandle.promise;
            if (this._sync.status.get() === SyncStatus.Stopped) {
                if (this._sync.error) {
                    throw this._sync.error;
                }
            }
        } catch (err) {
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
    get sync() {
        return this._sync;
    }
    get session() {
        return this._session;
    }
    get reconnector() {
        return this._reconnector;
    }
    stop() {
        if (this._reconnectSubscription) {
            this._reconnectSubscription();
            this._reconnectSubscription = null;
        }
        if (this._sync) {
            this._sync.stop();
        }
        if (this._session) {
            this._session.stop();
        }
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
    "roomMembers",
    "timelineEvents",
    "timelineFragments",
    "pendingEvents",
    "userIdentities",
    "deviceIdentities",
    "olmSessions",
    "inboundGroupSessions",
    "outboundGroupSessions",
    "groupSessionDecryptions",
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
                fullMessage += `(code: ${cause.code}) `;
            }
        }
        if (value) {
            fullMessage += `(value: ${JSON.stringify(value)}) `;
        }
        if (cause) {
            fullMessage += cause.message;
        }
        super(fullMessage);
        if (cause) {
            this.errcode = cause.name;
        }
        this.cause = cause;
        this.value = value;
    }
    get name() {
        return "StorageError";
    }
}

class WrappedDOMException extends StorageError {
    constructor(request) {
        const source = request?.source;
        const storeName = source?.name || "<unknown store>";
        const databaseName = source?.transaction?.db?.name || "<unknown db>";
        super(`Failed IDBRequest on ${databaseName}.${storeName}`, request.error);
        this.storeName = storeName;
        this.databaseName = databaseName;
    }
}
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
        const txn = ev.target.transaction;
        const oldVersion = ev.oldVersion;
        createObjectStore(db, txn, oldVersion, version);
    };
    return reqAsPromise(req);
}
function reqAsPromise(req) {
    return new Promise((resolve, reject) => {
        req.addEventListener("success", event => resolve(event.target.result));
        req.addEventListener("error", event => reject(new WrappedDOMException(event.target)));
    });
}
function txnAsPromise(txn) {
    return new Promise((resolve, reject) => {
        txn.addEventListener("complete", resolve);
        txn.addEventListener("abort", event => reject(new WrappedDOMException(event.target)));
    });
}
function iterateCursor(cursorRequest, processValue) {
    return new Promise((resolve, reject) => {
        cursorRequest.onerror = () => {
            reject(new StorageError("Query failed", cursorRequest.error));
        };
        cursorRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (!cursor) {
                resolve(false);
                return;
            }
            const result = processValue(cursor.value, cursor.key);
            const done = result?.done;
            const jumpTo = result?.jumpTo;
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
        if (this._target.supports("getKey")) {
            return reqAsPromise(this._target.getKey(key));
        } else {
            return reqAsPromise(this._target.get(key)).then(value => {
                if (value) {
                    return value[this._target.keyPath];
                }
            });
        }
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
    async iterateKeys(range, callback) {
        const cursor = this._target.openKeyCursor(range, "next");
        await iterateCursor(cursor, (_, key) => {
            return {done: callback(key)};
        });
    }
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
        return this._selectUntil(range, (results) => {
            return results.length === amount;
        }, direction);
    }
    async _selectUntil(range, predicate, direction) {
        const cursor = this._openCursor(range, direction);
        const results = [];
        await iterateCursor(cursor, (value) => {
            results.push(value);
            return {done: predicate(results, value)};
        });
        return results;
    }
    async _selectWhile(range, predicate, direction) {
        const cursor = this._openCursor(range, direction);
        const results = [];
        await iterateCursor(cursor, (value) => {
            const passesPredicate = predicate(value);
            if (passesPredicate) {
                results.push(value);
            }
            return {done: !passesPredicate};
        });
        return results;
    }
    async iterateWhile(range, predicate) {
        const cursor = this._openCursor(range, "next");
        await iterateCursor(cursor, (value) => {
            const passesPredicate = predicate(value);
            return {done: !passesPredicate};
        });
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
    get keyPath() {
        if (this._qt.objectStore) {
            return this._qt.objectStore.keyPath;
        } else {
            return this._qt.keyPath;
        }
    }
    supports(methodName) {
        return !!this._qt[methodName];
    }
    openKeyCursor(...params) {
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
            throw new StorageError(`put on ${err.databaseName}.${err.storeName} failed`, originalErr, value);
        }
    }
    async add(value) {
        try {
            return await reqAsPromise(this._idbStore.add(value));
        } catch(err) {
            const originalErr = err.cause;
            throw new StorageError(`add on ${err.databaseName}.${err.storeName} failed`, originalErr, value);
        }
    }
    async delete(keyOrKeyRange) {
        try {
            return await reqAsPromise(this._idbStore.delete(keyOrKeyRange));
        } catch(err) {
            const originalErr = err.cause;
            throw new StorageError(`delete on ${err.databaseName}.${err.storeName} failed`, originalErr, keyOrKeyRange);
        }
    }
}

class SessionStore {
	constructor(sessionStore) {
		this._sessionStore = sessionStore;
	}
	async get(key) {
		const entry = await this._sessionStore.get(key);
		if (entry) {
			return entry.value;
		}
	}
	set(key, value) {
		return this._sessionStore.put({key, value});
	}
    add(key, value) {
        return this._sessionStore.add({key, value});
    }
    remove(key) {
        this._sessionStore.delete(key);
    }
}

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
            if (this._only) {
                return IDBKeyRange.only(encodeKey(roomId, this._only.fragmentId, this._only.eventIndex));
            }
            if (this._lower && !this._upper) {
                return IDBKeyRange.bound(
                    encodeKey(roomId, this._lower.fragmentId, this._lower.eventIndex),
                    encodeKey(roomId, this._lower.fragmentId, WebPlatform.maxStorageKey),
                    this._lowerOpen,
                    false
                );
            }
            if (!this._lower && this._upper) {
                return IDBKeyRange.bound(
                    encodeKey(roomId, this._upper.fragmentId, WebPlatform.minStorageKey),
                    encodeKey(roomId, this._upper.fragmentId, this._upper.eventIndex),
                    false,
                    this._upperOpen
                );
            }
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
class TimelineEventStore {
    constructor(timelineStore) {
        this._timelineStore = timelineStore;
    }
    onlyRange(eventKey) {
        return new Range(eventKey);
    }
    upperBoundRange(eventKey, open=false) {
        return new Range(undefined, undefined, eventKey, undefined, open);
    }
    lowerBoundRange(eventKey, open=false) {
        return new Range(undefined, eventKey, undefined, open);
    }
    boundRange(lower, upper, lowerOpen=false, upperOpen=false) {
        return new Range(undefined, lower, upper, lowerOpen, upperOpen);
    }
    async lastEvents(roomId, fragmentId, amount) {
        const eventKey = EventKey.maxKey;
        eventKey.fragmentId = fragmentId;
        return this.eventsBefore(roomId, eventKey, amount);
    }
    async firstEvents(roomId, fragmentId, amount) {
        const eventKey = EventKey.minKey;
        eventKey.fragmentId = fragmentId;
        return this.eventsAfter(roomId, eventKey, amount);
    }
    eventsAfter(roomId, eventKey, amount) {
        const idbRange = this.lowerBoundRange(eventKey, true).asIDBKeyRange(roomId);
        return this._timelineStore.selectLimit(idbRange, amount);
    }
    async eventsBefore(roomId, eventKey, amount) {
        const range = this.upperBoundRange(eventKey, true).asIDBKeyRange(roomId);
        const events = await this._timelineStore.selectLimitReverse(range, amount);
        events.reverse();
        return events;
    }
    async findFirstOccurringEventId(roomId, eventIds) {
        const byEventId = this._timelineStore.index("byEventId");
        const keys = eventIds.map(eventId => encodeEventIdKey(roomId, eventId));
        const results = new Array(keys.length);
        let firstFoundKey;
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
    insert(entry) {
        entry.key = encodeKey(entry.roomId, entry.fragmentId, entry.eventIndex);
        entry.eventIdKey = encodeEventIdKey(entry.roomId, entry.event.event_id);
        return this._timelineStore.add(entry);
    }
    update(entry) {
        return this._timelineStore.put(entry);
    }
    get(roomId, eventKey) {
        return this._timelineStore.get(encodeKey(roomId, eventKey.fragmentId, eventKey.eventIndex));
    }
    removeRange(roomId, range) {
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
	async getAllForType(type) {
	}
	async get(type, stateKey) {
	}
	async set(roomId, event) {
        const key = `${roomId}|${event.type}|${event.state_key}`;
        const entry = {roomId, event, key};
		return this._roomStateStore.put(entry);
	}
}

function encodeKey$1(roomId, userId) {
    return `${roomId}|${userId}`;
}
function decodeKey(key) {
    const [roomId, userId] = key.split("|");
    return {roomId, userId};
}
class RoomMemberStore {
    constructor(roomMembersStore) {
        this._roomMembersStore = roomMembersStore;
    }
	get(roomId, userId) {
        return this._roomMembersStore.get(encodeKey$1(roomId, userId));
	}
	async set(member) {
        member.key = encodeKey$1(member.roomId, member.userId);
        return this._roomMembersStore.put(member);
	}
    getAll(roomId) {
        const range = IDBKeyRange.lowerBound(encodeKey$1(roomId, ""));
        return this._roomMembersStore.selectWhile(range, member => {
            return member.roomId === roomId;
        });
    }
    async getAllUserIds(roomId) {
        const userIds = [];
        const range = IDBKeyRange.lowerBound(encodeKey$1(roomId, ""));
        await this._roomMembersStore.iterateKeys(range, key => {
            const decodedKey = decodeKey(key);
            if (decodedKey.roomId === roomId) {
                userIds.push(decodedKey.userId);
                return false;
            }
            return true;
        });
        return userIds;
    }
    async getUserIdsNeedingRoomKey(roomId) {
        const userIds = [];
        const range = IDBKeyRange.lowerBound(encodeKey$1(roomId, ""));
        await this._roomMembersStore.iterateWhile(range, member => {
            if (member.roomId !== roomId) {
                return false;
            }
            if (member.needsRoomKey) {
                userIds.push(member.userId);
            }
            return true;
        });
        return userIds;
    }
}

function encodeKey$2(roomId, fragmentId) {
    return `${roomId}|${encodeUint32(fragmentId)}`;
}
class TimelineFragmentStore {
    constructor(store) {
        this._store = store;
    }
    _allRange(roomId) {
        try {
            return IDBKeyRange.bound(
                encodeKey$2(roomId, WebPlatform.minStorageKey),
                encodeKey$2(roomId, WebPlatform.maxStorageKey)
            );
        } catch (err) {
            throw new StorageError(`error from IDBKeyRange with roomId ${roomId}`, err);
        }
    }
    all(roomId) {
        return this._store.selectAll(this._allRange(roomId));
    }
    liveFragment(roomId) {
        return this._store.findReverse(this._allRange(roomId), fragment => {
            return typeof fragment.nextId !== "number" && typeof fragment.nextToken !== "string";
        });
    }
    add(fragment) {
        fragment.key = encodeKey$2(fragment.roomId, fragment.id);
        return this._store.add(fragment);
    }
    update(fragment) {
        return this._store.put(fragment);
    }
    get(roomId, fragmentId) {
        return this._store.get(encodeKey$2(roomId, fragmentId));
    }
}

function encodeKey$3(roomId, queueIndex) {
    return `${roomId}|${encodeUint32(queueIndex)}`;
}
function decodeKey$1(key) {
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
            encodeKey$3(roomId, WebPlatform.minStorageKey),
            encodeKey$3(roomId, WebPlatform.maxStorageKey),
            false,
            false,
        );
        const maxKey = await this._eventStore.findMaxKey(range);
        if (maxKey) {
            return decodeKey$1(maxKey).queueIndex;
        }
    }
    remove(roomId, queueIndex) {
        const keyRange = IDBKeyRange.only(encodeKey$3(roomId, queueIndex));
        this._eventStore.delete(keyRange);
    }
    async exists(roomId, queueIndex) {
        const keyRange = IDBKeyRange.only(encodeKey$3(roomId, queueIndex));
        const key = await this._eventStore.getKey(keyRange);
        return !!key;
    }
    add(pendingEvent) {
        pendingEvent.key = encodeKey$3(pendingEvent.roomId, pendingEvent.queueIndex);
        return this._eventStore.add(pendingEvent);
    }
    update(pendingEvent) {
        return this._eventStore.put(pendingEvent);
    }
    getAll() {
        return this._eventStore.selectAll();
    }
}

class UserIdentityStore {
    constructor(store) {
        this._store = store;
    }
    get(userId) {
        return this._store.get(userId);
    }
    set(userIdentity) {
        this._store.put(userIdentity);
    }
    remove(userId) {
        return this._store.delete(userId);
    }
}

function encodeKey$4(userId, deviceId) {
    return `${userId}|${deviceId}`;
}
class DeviceIdentityStore {
    constructor(store) {
        this._store = store;
    }
    getAllForUserId(userId) {
        const range = IDBKeyRange.lowerBound(encodeKey$4(userId, ""));
        return this._store.selectWhile(range, device => {
            return device.userId === userId;
        });
    }
    get(userId, deviceId) {
        return this._store.get(encodeKey$4(userId, deviceId));
    }
    set(deviceIdentity) {
        deviceIdentity.key = encodeKey$4(deviceIdentity.userId, deviceIdentity.deviceId);
        this._store.put(deviceIdentity);
    }
    getByCurve25519Key(curve25519Key) {
        return this._store.index("byCurve25519Key").get(curve25519Key);
    }
}

function encodeKey$5(senderKey, sessionId) {
    return `${senderKey}|${sessionId}`;
}
function decodeKey$2(key) {
    const [senderKey, sessionId] = key.split("|");
    return {senderKey, sessionId};
}
class OlmSessionStore {
    constructor(store) {
        this._store = store;
    }
    async getSessionIds(senderKey) {
        const sessionIds = [];
        const range = IDBKeyRange.lowerBound(encodeKey$5(senderKey, ""));
        await this._store.iterateKeys(range, key => {
            const decodedKey = decodeKey$2(key);
            if (decodedKey.senderKey === senderKey) {
                sessionIds.push(decodedKey.sessionId);
                return false;
            }
            return true;
        });
        return sessionIds;
    }
    getAll(senderKey) {
        const range = IDBKeyRange.lowerBound(encodeKey$5(senderKey, ""));
        return this._store.selectWhile(range, session => {
            return session.senderKey === senderKey;
        });
    }
    get(senderKey, sessionId) {
        return this._store.get(encodeKey$5(senderKey, sessionId));
    }
    set(session) {
        session.key = encodeKey$5(session.senderKey, session.sessionId);
        return this._store.put(session);
    }
    remove(senderKey, sessionId) {
        return this._store.delete(encodeKey$5(senderKey, sessionId));
    }
}

function encodeKey$6(roomId, senderKey, sessionId) {
    return `${roomId}|${senderKey}|${sessionId}`;
}
class InboundGroupSessionStore {
    constructor(store) {
        this._store = store;
    }
    async has(roomId, senderKey, sessionId) {
        const key = encodeKey$6(roomId, senderKey, sessionId);
        const fetchedKey = await this._store.getKey(key);
        return key === fetchedKey;
    }
    get(roomId, senderKey, sessionId) {
        return this._store.get(encodeKey$6(roomId, senderKey, sessionId));
    }
    set(session) {
        session.key = encodeKey$6(session.roomId, session.senderKey, session.sessionId);
        this._store.put(session);
    }
}

class OutboundGroupSessionStore {
    constructor(store) {
        this._store = store;
    }
    remove(roomId) {
        this._store.delete(roomId);
    }
    get(roomId) {
        return this._store.get(roomId);
    }
    set(session) {
        this._store.put(session);
    }
}

function encodeKey$7(roomId, sessionId, messageIndex) {
    return `${roomId}|${sessionId}|${messageIndex}`;
}
class GroupSessionDecryptionStore {
    constructor(store) {
        this._store = store;
    }
    get(roomId, sessionId, messageIndex) {
        return this._store.get(encodeKey$7(roomId, sessionId, messageIndex));
    }
    set(decryption) {
        decryption.key = encodeKey$7(decryption.roomId, decryption.sessionId, decryption.messageIndex);
        this._store.put(decryption);
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
    get roomMembers() {
        return this._store("roomMembers", idbStore => new RoomMemberStore(idbStore));
    }
    get pendingEvents() {
        return this._store("pendingEvents", idbStore => new PendingEventStore(idbStore));
    }
    get userIdentities() {
        return this._store("userIdentities", idbStore => new UserIdentityStore(idbStore));
    }
    get deviceIdentities() {
        return this._store("deviceIdentities", idbStore => new DeviceIdentityStore(idbStore));
    }
    get olmSessions() {
        return this._store("olmSessions", idbStore => new OlmSessionStore(idbStore));
    }
    get inboundGroupSessions() {
        return this._store("inboundGroupSessions", idbStore => new InboundGroupSessionStore(idbStore));
    }
    get outboundGroupSessions() {
        return this._store("outboundGroupSessions", idbStore => new OutboundGroupSessionStore(idbStore));
    }
    get groupSessionDecryptions() {
        return this._store("groupSessionDecryptions", idbStore => new GroupSessionDecryptionStore(idbStore));
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
        const results = data[name] = [];
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

const schema = [
    createInitialStores,
    createMemberStore,
    migrateSession,
    createIdentityStores,
    createOlmSessionStore,
    createInboundGroupSessionsStore,
    createOutboundGroupSessionsStore,
    createGroupSessionDecryptions,
    addSenderKeyIndexToDeviceStore
];
function createInitialStores(db) {
    db.createObjectStore("session", {keyPath: "key"});
    db.createObjectStore("roomSummary", {keyPath: "roomId"});
    db.createObjectStore("timelineFragments", {keyPath: "key"});
    const timelineEvents = db.createObjectStore("timelineEvents", {keyPath: "key"});
    timelineEvents.createIndex("byEventId", "eventIdKey", {unique: true});
    db.createObjectStore("roomState", {keyPath: "key"});
    db.createObjectStore("pendingEvents", {keyPath: "key"});
}
async function createMemberStore(db, txn) {
    const roomMembers = new RoomMemberStore(db.createObjectStore("roomMembers", {keyPath: "key"}));
    const roomState = txn.objectStore("roomState");
    await iterateCursor(roomState.openCursor(), entry => {
        if (entry.event.type === EVENT_TYPE) {
            roomState.delete(entry.key);
            const member = RoomMember.fromMemberEvent(entry.roomId, entry.event);
            if (member) {
                roomMembers.set(member.serialize());
            }
        }
    });
}
async function migrateSession(db, txn) {
    const session = txn.objectStore("session");
    try {
        const PRE_MIGRATION_KEY = 1;
        const entry = await reqAsPromise(session.get(PRE_MIGRATION_KEY));
        if (entry) {
            session.delete(PRE_MIGRATION_KEY);
            const {syncToken, syncFilterId, serverVersions} = entry.value;
            const store = new SessionStore(session);
            store.set("sync", {token: syncToken, filterId: syncFilterId});
            store.set("serverVersions", serverVersions);
        }
    } catch (err) {
        txn.abort();
        console.error("could not migrate session", err.stack);
    }
}
function createIdentityStores(db) {
    db.createObjectStore("userIdentities", {keyPath: "userId"});
    db.createObjectStore("deviceIdentities", {keyPath: "key"});
}
function createOlmSessionStore(db) {
    db.createObjectStore("olmSessions", {keyPath: "key"});
}
function createInboundGroupSessionsStore(db) {
    db.createObjectStore("inboundGroupSessions", {keyPath: "key"});
}
function createOutboundGroupSessionsStore(db) {
    db.createObjectStore("outboundGroupSessions", {keyPath: "roomId"});
}
function createGroupSessionDecryptions(db) {
    db.createObjectStore("groupSessionDecryptions", {keyPath: "key"});
}
function addSenderKeyIndexToDeviceStore(db, txn) {
    const deviceIdentities = txn.objectStore("deviceIdentities");
    deviceIdentities.createIndex("byCurve25519Key", "curve25519Key", {unique: true});
}

const sessionName = sessionId => `brawl_session_${sessionId}`;
const openDatabaseWithSessionId = sessionId => openDatabase(sessionName(sessionId), createStores, schema.length);
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
async function createStores(db, txn, oldVersion, version) {
    const startIdx = oldVersion || 0;
    for(let i = startIdx; i < version; ++i) {
        await schema[i](db, txn);
    }
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
    let firstChar = name.charAt(0);
    if (firstChar === "!" || firstChar === "@" || firstChar === "#") {
        firstChar = name.charAt(1);
    }
    return firstChar.toUpperCase();
}
function hashCode(str) {
    let hash = 0;
    let i;
    let chr;
    if (str.length === 0) {
        return hash;
    }
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}
function getIdentifierColorNumber(id) {
    return (hashCode(id) % 8) + 1;
}

class ViewModel extends EventEmitter {
    constructor({clock, emitChange} = {}) {
        super();
        this.disposables = null;
        this._options = {clock, emitChange};
    }
    childOptions(explicitOptions) {
        return Object.assign({}, this._options, explicitOptions);
    }
    track(disposable) {
        if (!this.disposables) {
            this.disposables = new Disposables();
        }
        return this.disposables.track(disposable);
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
    i18n(parts, ...expr) {
        let result = "";
        for (let i = 0; i < parts.length; ++i) {
            result = result + parts[i];
            if (i < expr.length) {
                result = result + expr[i];
            }
        }
        return result;
    }
    updateOptions(options) {
        this._options = Object.assign(this._options, options);
    }
    emitChange(changedProps) {
        if (this._options.emitChange) {
            this._options.emitChange(changedProps);
        } else {
            this.emit("change", changedProps);
        }
    }
    get clock() {
        return this._options.clock;
    }
}

function isSortedAsUnread(vm) {
    return vm.isUnread || (vm.isOpen && vm._wasUnreadWhenOpening);
}
class RoomTileViewModel extends ViewModel {
    constructor(options) {
        super(options);
        const {room, emitOpen} = options;
        this._room = room;
        this._emitOpen = emitOpen;
        this._isOpen = false;
        this._wasUnreadWhenOpening = false;
    }
    close() {
        if (this._isOpen) {
            this._isOpen = false;
            this.emitChange("isOpen");
        }
    }
    open() {
        if (!this._isOpen) {
            this._isOpen = true;
            this._wasUnreadWhenOpening = this._room.isUnread;
            this.emitChange("isOpen");
            this._emitOpen(this._room, this);
        }
    }
    compare(other) {
        const myRoom = this._room;
        const theirRoom = other._room;
        if (myRoom.isLowPriority !== theirRoom.isLowPriority) {
            if (myRoom.isLowPriority) {
                return 1;
            }
            return -1;
        }
        if (isSortedAsUnread(this) !== isSortedAsUnread(other)) {
            if (isSortedAsUnread(this)) {
                return -1;
            }
            return 1;
        }
        const myTimestamp = myRoom.lastMessageTimestamp;
        const theirTimestamp = theirRoom.lastMessageTimestamp;
        const myTimestampValid = Number.isSafeInteger(myTimestamp);
        const theirTimestampValid = Number.isSafeInteger(theirTimestamp);
        if (myTimestampValid !== theirTimestampValid) {
            if (!theirTimestampValid) {
                return -1;
            }
            return 1;
        }
        const timeDiff = theirTimestamp - myTimestamp;
        if (timeDiff === 0 || !theirTimestampValid || !myTimestampValid) {
            const nameCmp = this.name.localeCompare(other.name);
            if (nameCmp === 0) {
                return this._room.id.localeCompare(other._room.id);
            }
            return nameCmp;
        }
        return timeDiff;
    }
    get isOpen() {
        return this._isOpen;
    }
    get isUnread() {
        return this._room.isUnread;
    }
    get name() {
        return this._room.name || this.i18n`Empty Room`;
    }
    get avatarLetter() {
        return avatarInitials(this.name);
    }
    get avatarColorNumber() {
        return getIdentifierColorNumber(this._room.id)
    }
    get avatarUrl() {
        if (this._room.avatarUrl) {
            return this._room.mediaRepository.mxcUrlThumbnail(this._room.avatarUrl, 32, 32, "crop");
        }
        return null;
    }
    get avatarTitle() {
        return this.name;
    }
    get badgeCount() {
        return this._room.notificationCount;
    }
    get isHighlighted() {
        return this._room.highlightCount !== 0;
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
        for (const tile of this._tiles) {
            tile.setUpdateEmit(this._emitSpontanousUpdate);
        }
    }
    _findTileIdx(entry) {
        return sortedIndex(this._tiles, entry, (entry, tile) => {
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
        const nextTile = this._getTileAtIdx(tileIdx);
        if (nextTile && nextTile.tryIncludeEntry(entry)) {
            this.emitUpdate(tileIdx, nextTile);
            return;
        }
        const newTile = this._tileCreator(entry);
        if (newTile) {
            if (prevTile) {
                prevTile.updateNextSibling(newTile);
                newTile.updatePreviousSibling(prevTile);
            }
            if (nextTile) {
                newTile.updateNextSibling(nextTile);
                nextTile.updatePreviousSibling(newTile);
            }
            this._tiles.splice(tileIdx, 0, newTile);
            this.emitAdd(tileIdx, newTile);
            newTile.setUpdateEmit(this._emitSpontanousUpdate);
        }
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
    }
    [Symbol.iterator]() {
        return this._tiles.values();
    }
    get length() {
        return this._tiles.length;
    }
    getFirst() {
        return this._tiles[0];
    }
}

class SimpleTile extends ViewModel {
    constructor({entry}) {
        super();
        this._entry = entry;
    }
    get shape() {
        return null;
    }
    get isContinuation() {
        return false;
    }
    get hasDateSeparator() {
        return false;
    }
    get internalId() {
        return this._entry.asEventKey().toString();
    }
    get isPending() {
        return this._entry.isPending;
    }
    setUpdateEmit(emitUpdate) {
        this.updateOptions({emitChange: paramName => emitUpdate(this, paramName)});
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
    updateEntry(entry) {
        this._entry = entry;
        return UpdateAction.Nothing();
    }
    removeEntry(entry) {
        return true;
    }
    tryIncludeEntry() {
        return false;
    }
    updatePreviousSibling(prev) {
    }
    updateNextSibling(next) {
    }
}

class GapTile extends SimpleTile {
    constructor(options, timeline) {
        super(options);
        this._timeline = timeline;
        this._loading = false;
        this._error = null;
    }
    async fill() {
        if (!this._loading) {
            this._loading = true;
            this.emitChange("isLoading");
            try {
                await this._timeline.fillGap(this._entry, 10);
            } catch (err) {
                console.error(`timeline.fillGap(): ${err.message}:\n${err.stack}`);
                this._error = err;
                this.emitChange("error");
                throw err;
            } finally {
                this._loading = false;
                this.emitChange("isLoading");
            }
        }
        return this._entry.edgeReached;
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
        this._mediaRepository = options.mediaRepository;
        this._clock = options.clock;
        this._isOwn = this._entry.sender === options.ownUserId;
        this._date = this._entry.timestamp ? new Date(this._entry.timestamp) : null;
        this._isContinuation = false;
    }
    get shape() {
        return "message";
    }
    get sender() {
        return this._entry.displayName || this._entry.sender;
    }
    get avatarColorNumber() {
        return getIdentifierColorNumber(this._entry.sender);
    }
    get avatarUrl() {
        if (this._entry.avatarUrl) {
            return this._mediaRepository.mxcUrlThumbnail(this._entry.avatarUrl, 30, 30, "crop");
        }
        return null;
    }
    get avatarLetter() {
        return avatarInitials(this.sender);
    }
    get avatarTitle() {
        return this.sender;
    }
    get date() {
        return this._date && this._date.toLocaleDateString({}, {month: "numeric", day: "numeric"});
    }
    get time() {
        return this._date && this._date.toLocaleTimeString({}, {hour: "numeric", minute: "2-digit"});
    }
    get isOwn() {
        return this._isOwn;
    }
    get isContinuation() {
        return this._isContinuation;
    }
    get isUnverified() {
        return this._entry.isUnverified;
    }
    _getContent() {
        return this._entry.content;
    }
    updatePreviousSibling(prev) {
        super.updatePreviousSibling(prev);
        let isContinuation = false;
        if (prev && prev instanceof MessageTile && prev.sender === this.sender) {
            const myTimestamp = this._entry.timestamp || this._clock.now();
            const otherTimestamp = prev._entry.timestamp || this._clock.now();
            isContinuation = (myTimestamp - otherTimestamp) < (5 * 60 * 1000);
        }
        if (isContinuation !== this._isContinuation) {
            this._isContinuation = isContinuation;
            this.emitChange("isContinuation");
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
    get thumbnailUrl() {
        const mxcUrl = this._getContent()?.url;
        if (typeof mxcUrl === "string") {
            return this._mediaRepository.mxcUrlThumbnail(mxcUrl, this.thumbnailWidth, this.thumbnailHeight, "scale");
        }
        return null;
    }
    get url() {
        const mxcUrl = this._getContent()?.url;
        if (typeof mxcUrl === "string") {
            return this._mediaRepository.mxcUrl(mxcUrl);
        }
        return null;
    }
    _scaleFactor() {
        const info = this._getContent()?.info;
        const scaleHeightFactor = MAX_HEIGHT / info?.h;
        const scaleWidthFactor = MAX_WIDTH / info?.w;
        return Math.min(scaleWidthFactor, scaleHeightFactor, 1);
    }
    get thumbnailWidth() {
        const info = this._getContent()?.info;
        return Math.round(info?.w * this._scaleFactor());
    }
    get thumbnailHeight() {
        const info = this._getContent()?.info;
        return Math.round(info?.h * this._scaleFactor());
    }
    get label() {
        return this._getContent().body;
    }
    get shape() {
        return "image";
    }
}

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
        return `${this._entry.displayName || this._entry.sender} named the room "${content.name}"`
    }
}

class RoomMemberTile extends SimpleTile {
    get shape() {
        return "announcement";
    }
    get announcement() {
        const {sender, content, prevContent, stateKey} = this._entry;
        const senderName =  this._entry.displayName || sender;
        const targetName = sender === stateKey ? senderName : (this._entry.content?.displayname || stateKey);
        const membership = content && content.membership;
        const prevMembership = prevContent && prevContent.membership;
        if (prevMembership === "join" && membership === "join") {
            if (content.avatar_url !== prevContent.avatar_url) {
                return `${senderName} changed their avatar`;
            } else if (content.displayname !== prevContent.displayname) {
                return `${senderName} changed their name to ${content.displayname}`;
            }
        } else if (membership === "join") {
            return `${targetName} joined the room`;
        } else if (membership === "invite") {
            return `${targetName} was invited to the room by ${senderName}`;
        } else if (prevMembership === "invite") {
            if (membership === "join") {
                return `${targetName} accepted the invitation to join the room`;
            } else if (membership === "leave") {
                return `${targetName} declined the invitation to join the room`;
            }
        } else if (membership === "leave") {
            if (stateKey === sender) {
                return `${targetName} left the room`;
            } else {
                const reason = content.reason;
                return `${targetName} was kicked from the room by ${senderName}${reason ? `: ${reason}` : ""}`;
            }
        } else if (membership === "ban") {
            return `${targetName} was banned from the room by ${senderName}`;
        }
        return `${sender} membership changed to ${content.membership}`;
    }
}

class EncryptedEventTile extends MessageTile {
    get text() {
        return this.i18n`**Encrypted message**`;
    }
}

function tilesCreator({room, ownUserId, clock}) {
    return function tilesCreator(entry, emitUpdate) {
        const options = {entry, emitUpdate, ownUserId, clock,
            mediaRepository: room.mediaRepository};
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
                            return new ImageTile(options);
                        case "m.location":
                            return new LocationTile(options);
                        default:
                            return null;
                    }
                }
                case "m.room.name":
                    return new RoomNameTile(options);
                case "m.room.member":
                    return new RoomMemberTile(options);
                case "m.room.encrypted":
                    return new EncryptedEventTile(options);
                default:
                    return null;
            }
        }
    }
}

class TimelineViewModel extends ViewModel {
    constructor(options) {
        super(options);
        const {room, timeline, ownUserId} = options;
        this._timeline = timeline;
        this._tiles = new TilesCollection(timeline.entries, tilesCreator({room, ownUserId, clock: this.clock}));
    }
    async loadAtTop() {
        const firstTile = this._tiles.getFirst();
        if (firstTile.shape === "gap") {
            return firstTile.fill();
        } else {
            await this._timeline.loadAtTop(10);
            return false;
        }
    }
    unloadAtTop(tileAmount) {
    }
    loadAtBottom() {
    }
    unloadAtBottom(tileAmount) {
    }
    get tiles() {
        return this._tiles;
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
        this._clearUnreadTimout = null;
    }
    async load() {
        this._room.on("change", this._onRoomChange);
        try {
            this._timeline = this.track(this._room.openTimeline());
            await this._timeline.load();
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
        this._clearUnreadTimout = this.clock.createTimeout(2000);
        try {
            await this._clearUnreadTimout.elapsed();
            await this._room.clearUnread();
        } catch (err) {
            if (err.name !== "AbortError") {
                throw err;
            }
        }
    }
    dispose() {
        super.dispose();
        if (this._clearUnreadTimout) {
            this._clearUnreadTimout.abort();
            this._clearUnreadTimout = null;
        }
    }
    close() {
        this._closeCallback();
    }
    _onRoomChange() {
        this.emitChange("name");
    }
    get name() {
        return this._room.name || this.i18n`Empty Room`;
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
    get avatarLetter() {
        return avatarInitials(this.name);
    }
    get avatarColorNumber() {
        return getIdentifierColorNumber(this._room.id)
    }
    get avatarUrl() {
        if (this._room.avatarUrl) {
            return this._room.mediaRepository.mxcUrlThumbnail(this._room.avatarUrl, 32, 32, "crop");
        }
        return null;
    }
    get avatarTitle() {
        return this.name;
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
class ComposerViewModel extends ViewModel {
    constructor(roomVM) {
        super();
        this._roomVM = roomVM;
        this._isEmpty = true;
    }
    sendMessage(message) {
        const success = this._roomVM._sendMessage(message);
        if (success) {
            this._isEmpty = true;
            this.emitChange("canSend");
        }
        return success;
    }
    get canSend() {
        return !this._isEmpty;
    }
    setInput(text) {
        this._isEmpty = text.length === 0;
        this.emitChange("canSend");
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
                case SyncStatus.InitialSync:
                case SyncStatus.CatchupSync:
                    return SessionStatus.FirstSync;
                case SyncStatus.Stopped:
                    return SessionStatus.SyncError;
            }
        }
 else {
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
        this._currentRoomTileViewModel = null;
        this._currentRoomViewModel = null;
        const roomTileVMs = this._session.rooms.mapValues((room, emitChange) => {
            return new RoomTileViewModel({
                room,
                emitChange,
                emitOpen: this._openRoom.bind(this)
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
        this._currentRoomTileViewModel?.close();
        this._currentRoomViewModel = this.disposeTracked(this._currentRoomViewModel);
    }
    _openRoom(room, roomTileVM) {
        this._closeCurrentRoom();
        this._currentRoomTileViewModel = roomTileVM;
        this._currentRoomViewModel = this.track(new RoomViewModel(this.childOptions({
            room,
            ownUserId: this._session.user.id,
            closeCallback: () => {
                this._closeCurrentRoom();
                this.emitChange("currentRoom");
            },
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
            this.emitChange("loading");
            this._sessionContainer = this._createAndStartSessionContainer();
            this._waitHandle = this._sessionContainer.loadStatus.waitFor(s => {
                this.emitChange("loadLabel");
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
                return;
            }
            const loadStatus = this._sessionContainer.loadStatus.get();
            if (loadStatus === LoadStatus.FirstSync || loadStatus === LoadStatus.Ready) {
                this._sessionCallback(this._sessionContainer);
            }
            if (this._sessionContainer.loadError) {
                console.error("session load error", this._sessionContainer.loadError);
            }
        } catch (err) {
            this._error = err;
            console.error("error thrown during session load", err.stack);
        } finally {
            this._loading = false;
            this.emitChange("loading");
        }
    }
    async cancel() {
        try {
            if (this._sessionContainer) {
                this._sessionContainer.stop();
                if (this._deleteSessionOnCancel) {
                    await this._sessionContainer.deleteSession();
                }
                this._sessionContainer = null;
            }
            if (this._waitHandle) {
                this._waitHandle.dispose();
                this._waitHandle = null;
            }
            this._sessionCallback();
        } catch (err) {
            this._error = err;
            this.emitChange();
        }
    }
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
                case LoadStatus.SessionSetup:
                    return `Setting up your encryption keys…`;
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
                    this._sessionCallback(sessionContainer);
                } else {
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
    get avatarColorNumber() {
        return getIdentifierColorNumber(this._sessionInfo.userId);
    }
    get avatarInitials() {
        return avatarInitials(this._sessionInfo.userId);
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
    async load() {
        const sessions = await this._sessionInfoStorage.getAll();
        this._sessions.setManyUnsorted(sessions.map(s => new SessionItemViewModel(s, this)));
    }
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
                        this._sessionCallback(sessionContainer);
                    } else {
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
        try {
            const data = JSON.parse(json);
            const {sessionInfo} = data;
            sessionInfo.comment = `Imported on ${new Date().toLocaleString()} from id ${sessionInfo.id}.`;
            sessionInfo.id = this._createSessionContainer().createNewSessionId();
            await this._storageFactory.import(sessionInfo.id, data.stores);
            await this._sessionInfoStorage.add(sessionInfo);
            this._sessions.set(new SessionItemViewModel(sessionInfo, this));
        } catch (err) {
            alert(err.message);
            console.error(err);
        }
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
        this._error = null;
        this._sessionViewModel = null;
        this._loginViewModel = null;
        this._sessionPickerViewModel = null;
        if (this._sessionContainer) {
            this._sessionContainer.stop();
            this._sessionContainer = null;
        }
        setter();
        this.emitChange("activeSection");
    }
    get error() { return this._error; }
    get sessionViewModel() { return this._sessionViewModel; }
    get loginViewModel() { return this._loginViewModel; }
    get sessionPickerViewModel() { return this._sessionPickerViewModel; }
}

function isChildren(children) {
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
        "pre", "button", "time", "input", "textarea", "label"],
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
        const fragment = document.createDocumentFragment();
        for (let item of this._list) {
            const child = this._childCreator(item);
            this._childInstances.push(child);
            const childDomNode = child.mount(this._mountArgs);
            fragment.appendChild(childDomNode);
        }
        this._root.appendChild(fragment);
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
class TemplateView {
    constructor(value, render = undefined) {
        this._value = value;
        this._render = render;
        this._eventListeners = null;
        this._bindings = null;
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
        } else if (this.render) {
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
                if (node.parentNode) {
                    node.parentNode.replaceChild(newNode, node);
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
    createTemplate(render) {
        return vm => new TemplateView(vm, render);
    }
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

function spinner(t, extraClasses = undefined) {
    return t.svg({className: Object.assign({"spinner": true}, extraClasses), viewBox:"0 0 100 100"},
        t.circle({cx:"50%", cy:"50%", r:"45%", pathLength:"100"})
    );
}
function renderAvatar(t, vm, size) {
    const hasAvatar = !!vm.avatarUrl;
    const avatarClasses = {
        avatar: true,
        [`usercolor${vm.avatarColorNumber}`]: !hasAvatar,
    };
    const sizeStr = size.toString();
    const avatarContent = hasAvatar ?
        t.img({src: vm => vm.avatarUrl, width: sizeStr, height: sizeStr, title: vm => vm.avatarTitle}) :
        vm => vm.avatarLetter;
    return t.div({className: avatarClasses}, [avatarContent]);
}

class RoomTile extends TemplateView {
    render(t, vm) {
        return t.li({"className": {"active": vm => vm.isOpen}}, [
            renderAvatar(t, vm, 32),
            t.div({className: "description"}, [
                t.div({className: {"name": true, unread: vm => vm.isUnread}}, vm => vm.name),
                t.div({className: {"badge": true, highlighted: vm => vm.isHighlighted, hidden: vm => !vm.badgeCount}}, vm => vm.badgeCount),
            ])
        ]);
    }
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
        return t.li({className}, [
            spinner(t),
            t.div(vm.i18n`Loading more messages …`),
            t.if(vm => vm.error, t.createTemplate(t => t.strong(vm => vm.error)))
        ]);
    }
}

function renderMessage(t, vm, children) {
    const classes = {
        "TextMessageView": true,
        own: vm.isOwn,
        pending: vm.isPending,
        unverified: vm.isUnverified,
        continuation: vm => vm.isContinuation,
    };
    const profile = t.div({className: "profile"}, [
        renderAvatar(t, vm, 30),
        t.div({className: `sender usercolor${vm.avatarColorNumber}`}, vm.sender)
    ]);
    children = [profile].concat(children);
    return t.li(
        {className: classes},
        t.div({className: "message-container"}, children)
    );
}

class TextMessageView extends TemplateView {
    render(t, vm) {
        return renderMessage(t, vm,
            [t.p([vm.text, t.time({className: {hidden: !vm.date}}, vm.date + " " + vm.time)])]
        );
    }
}

class ImageView extends TemplateView {
    render(t, vm) {
        const heightRatioPercent = (vm.thumbnailHeight / vm.thumbnailWidth) * 100;
        const image = t.img({
            className: "picture",
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
        return renderMessage(t, vm,
            [t.div(linkContainer), t.p(t.time(vm.date + " " + vm.time))]
        );
    }
}

class AnnouncementView extends TemplateView {
    render(t) {
        return t.li({className: "AnnouncementView"}, t.div(vm => vm.announcement));
    }
}

class TimelineList extends ListView {
    constructor(viewModel) {
        const options = {
            className: "Timeline",
            list: viewModel.tiles,
        };
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
        this._viewModel = viewModel;
    }
    async _loadAtTopWhile(predicate) {
        if (this._topLoadingPromise) {
            return;
        }
        try {
            while (predicate()) {
                this._topLoadingPromise = this._viewModel.loadAtTop();
                const shouldStop = await this._topLoadingPromise;
                if (shouldStop) {
                    break;
                }
            }
        }
        catch (err) {
        }
        finally {
            this._topLoadingPromise = null;
        }
    }
    async _onScroll() {
        const PAGINATE_OFFSET = 100;
        const root = this.root();
        if (root.scrollTop < PAGINATE_OFFSET && !this._topLoadingPromise && this._viewModel) {
            let beforeContentHeight = root.scrollHeight;
            let lastContentHeight = beforeContentHeight;
            this._loadAtTopWhile(() => {
                const contentHeight = root.scrollHeight;
                const amountGrown = contentHeight - beforeContentHeight;
                root.scrollTop = root.scrollTop + (contentHeight - lastContentHeight);
                lastContentHeight = contentHeight;
                return amountGrown < PAGINATE_OFFSET;
            });
        }
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
    async loadList() {
        super.loadList();
        const root = this.root();
        await Promise.resolve();
        const {scrollHeight, clientHeight} = root;
        if (scrollHeight > clientHeight) {
            root.scrollTop = root.scrollHeight;
        }
        this._loadAtTopWhile(() => {
            const {scrollHeight, clientHeight} = root;
            return scrollHeight <= clientHeight;
        });
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
        const root = this.root();
        if (this._atBottom) {
            root.scrollTop = root.scrollHeight;
        }
    }
}

class TimelineLoadingView extends TemplateView {
    render(t, vm) {
        return t.div({className: "TimelineLoadingView"}, [
            spinner(t),
            t.div(vm.i18n`Loading messages…`)
        ]);
    }
}

class MessageComposer extends TemplateView {
    constructor(viewModel) {
        super(viewModel);
        this._input = null;
    }
    render(t, vm) {
        this._input = t.input({
            placeholder: "Send a message ...",
            onKeydown: e => this._onKeyDown(e),
            onInput: () => vm.setInput(this._input.value),
        });
        return t.div({className: "MessageComposer"}, [
            this._input,
            t.button({
                className: "send",
                title: vm.i18n`Send`,
                disabled: vm => !vm.canSend,
                onClick: () => this._trySend(),
            }, vm.i18n`Send`),
        ]);
    }
    _trySend() {
        if (this.value.sendMessage(this._input.value)) {
            this._input.value = "";
        }
    }
    _onKeyDown(event) {
        if (event.key === "Enter") {
            this._trySend();
        }
    }
}

class RoomView extends TemplateView {
    render(t, vm) {
        return t.div({className: "RoomView"}, [
            t.div({className: "TimelinePanel"}, [
                t.div({className: "RoomHeader"}, [
                    t.button({className: "back", onClick: () => vm.close()}),
                    renderAvatar(t, vm, 32),
                    t.div({className: "room-description"}, [
                        t.h2(vm => vm.name),
                    ]),
                ]),
                t.div({className: "RoomView_error"}, vm => vm.error),
                t.mapView(vm => vm.timelineViewModel, timelineViewModel => {
                    return timelineViewModel ?
                        new TimelineList(timelineViewModel) :
                        new TimelineLoadingView(vm);
                }),
                t.view(new MessageComposer(this.value.composerViewModel)),
            ])
        ]);
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
        const parent = oldRoot.parentNode;
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
    update() {}
}

function hydrogenGithubLink(t) {
    if (window.HYDROGEN_VERSION) {
        return t.a({target: "_blank",
            href: `https://github.com/vector-im/hydrogen-web/releases/tag/v${window.HYDROGEN_VERSION}`},
            `Hydrogen v${window.HYDROGEN_VERSION} on Github`);
    } else {
        return t.a({target: "_blank", href: "https://github.com/vector-im/hydrogen-web"},
            "Hydrogen on Github");
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
        const username = t.input({
            id: "username",
            type: "text",
            placeholder: vm.i18n`Username`,
            disabled
        });
        const password = t.input({
            id: "password",
            type: "password",
            placeholder: vm.i18n`Password`,
            disabled
        });
        const homeserver = t.input({
            id: "homeserver",
            type: "text",
            placeholder: vm.i18n`Your matrix homeserver`,
            value: vm.defaultHomeServer,
            disabled
        });
        return t.div({className: "PreSessionScreen"}, [
            t.div({className: "logo"}),
            t.div({className: "LoginView form"}, [
                t.h1([vm.i18n`Sign In`]),
                t.if(vm => vm.error, t.createTemplate(t => t.div({className: "error"}, vm => vm.error))),
                t.div({className: "form-row"}, [t.label({for: "username"}, vm.i18n`Username`), username]),
                t.div({className: "form-row"}, [t.label({for: "password"}, vm.i18n`Password`), password]),
                t.div({className: "form-row"}, [t.label({for: "homeserver"}, vm.i18n`Homeserver`), homeserver]),
                t.mapView(vm => vm.loadViewModel, loadViewModel => loadViewModel ? new SessionLoadView(loadViewModel) : null),
                t.div({className: "button-row"}, [
                    t.button({
                        className: "styled secondary",
                        onClick: () => vm.cancel(), disabled
                    }, [vm.i18n`Go Back`]),
                    t.button({
                        className: "styled primary",
                        onClick: () => vm.login(username.value, password.value, homeserver.value),
                        disabled
                    }, vm.i18n`Log In`),
                ]),
                t.p(hydrogenGithubLink(t))
            ])
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
            className: "destructive",
            disabled: vm => vm.isDeleting,
            onClick: this._onDeleteClick.bind(this),
        }, "Sign Out");
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
        const errorMessage = t.if(vm => vm.error, t.createTemplate(t => t.p({className: "error"}, vm => vm.error)));
        return t.li([
            t.div({className: "session-info"}, [
                t.div({className: `avatar usercolor${vm.avatarColorNumber}`}, vm => vm.avatarInitials),
                t.div({className: "user-id"}, vm => vm.label),
            ]),
            t.div({className: "session-actions"}, [
                deleteButton,
                exportButton,
                downloadExport,
                clearButton,
            ]),
            errorMessage
        ]);
    }
}
class SessionPickerView extends TemplateView {
    render(t, vm) {
        const sessionList = new ListView({
            list: vm.sessions,
            onItemClick: (item, event) => {
                if (event.target.closest(".session-info")) {
                    vm.pick(item.value.id);
                }
            },
            parentProvidesUpdates: false,
        }, sessionInfo => {
            return new SessionPickerItemView(sessionInfo);
        });
        return t.div({className: "PreSessionScreen"}, [
            t.div({className: "logo"}),
            t.div({className: "SessionPickerView"}, [
                t.h1(["Continue as …"]),
                t.view(sessionList),
                t.div({className: "button-row"}, [
                    t.button({
                        className: "styled secondary",
                        onClick: async () => vm.import(await selectFileAsText("application/json"))
                    }, vm.i18n`Import a session`),
                    t.button({
                        className: "styled primary",
                        onClick: () => vm.cancel()
                    }, vm.i18n`Sign In`)
                ]),
                t.if(vm => vm.loadViewModel, vm => new SessionLoadView(vm.loadViewModel)),
                t.p(hydrogenGithubLink(t))
            ])
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

class WorkerState {
    constructor(worker) {
        this.worker = worker;
        this.busy = false;
    }
    attach(pool) {
        this.worker.addEventListener("message", pool);
        this.worker.addEventListener("error", pool);
    }
    detach(pool) {
        this.worker.removeEventListener("message", pool);
        this.worker.removeEventListener("error", pool);
    }
}
class Request {
    constructor(message, pool) {
        this._promise = new Promise((_resolve, _reject) => {
            this._resolve = _resolve;
            this._reject = _reject;
        });
        this._message = message;
        this._pool = pool;
        this._worker = null;
    }
    abort() {
        if (this._isNotDisposed) {
            this._pool._abortRequest(this);
            this._dispose();
        }
    }
    response() {
        return this._promise;
    }
    _dispose() {
        this._reject = null;
        this._resolve = null;
    }
    get _isNotDisposed() {
        return this._resolve && this._reject;
    }
}
class WorkerPool {
    constructor(path, amount) {
        this._workers = [];
        for (let i = 0; i < amount ; ++i) {
            const worker = new WorkerState(new Worker(path));
            worker.attach(this);
            this._workers[i] = worker;
        }
        this._requests = new Map();
        this._counter = 0;
        this._pendingFlag = false;
        this._init = null;
    }
    init() {
        const promise = new Promise((resolve, reject) => {
            this._init = {resolve, reject};
        });
        this.sendAll({type: "ping"})
            .then(this._init.resolve, this._init.reject)
            .finally(() => {
                this._init = null;
            });
        return promise;
    }
    handleEvent(e) {
        if (e.type === "message") {
            const message = e.data;
            const request = this._requests.get(message.replyToId);
            if (request) {
                request._worker.busy = false;
                if (request._isNotDisposed) {
                    if (message.type === "success") {
                        request._resolve(message.payload);
                    } else if (message.type === "error") {
                        request._reject(new Error(message.stack));
                    }
                    request._dispose();
                }
                this._requests.delete(message.replyToId);
            }
            this._sendPending();
        } else if (e.type === "error") {
            if (this._init) {
                this._init.reject(new Error("worker error during init"));
            }
            console.error("worker error", e);
        }
    }
    _getPendingRequest() {
        for (const r of this._requests.values()) {
            if (!r._worker) {
                return r;
            }
        }
    }
    _getFreeWorker() {
        for (const w of this._workers) {
            if (!w.busy) {
                return w;
            }
        }
    }
    _sendPending() {
        this._pendingFlag = false;
        let success;
        do {
            success = false;
            const request = this._getPendingRequest();
            if (request) {
                const worker = this._getFreeWorker();
                if (worker) {
                    this._sendWith(request, worker);
                    success = true;
                }
            }
        } while (success);
    }
    _sendWith(request, worker) {
        request._worker = worker;
        worker.busy = true;
        worker.worker.postMessage(request._message);
    }
    _enqueueRequest(message) {
        this._counter += 1;
        message.id = this._counter;
        const request = new Request(message, this);
        this._requests.set(message.id, request);
        return request;
    }
    send(message) {
        const request = this._enqueueRequest(message);
        const worker = this._getFreeWorker();
        if (worker) {
            this._sendWith(request, worker);
        }
        return request;
    }
    sendAll(message) {
        const promises = this._workers.map(worker => {
            const request = this._enqueueRequest(Object.assign({}, message));
            this._sendWith(request, worker);
            return request.response();
        });
        return Promise.all(promises);
    }
    dispose() {
        for (const w of this._workers) {
            w.detach(this);
            w.worker.terminate();
        }
    }
    _trySendPendingInNextTick() {
        if (!this._pendingFlag) {
            this._pendingFlag = true;
            Promise.resolve().then(() => {
                this._sendPending();
            });
        }
    }
    _abortRequest(request) {
        request._reject(new AbortError());
        if (request._worker) {
            request._worker.busy = false;
        }
        this._requests.delete(request._message.id);
        this._trySendPendingInNextTick();
    }
}

function addScript(src) {
    return new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.setAttribute("src", src );
        s.onload=resolve;
        s.onerror=reject;
        document.body.appendChild(s);
    });
}
async function loadOlm(olmPaths) {
    if (window.msCrypto && !window.crypto) {
        window.crypto = window.msCrypto;
    }
    if (olmPaths) {
        if (window.WebAssembly) {
            await addScript(olmPaths.wasmBundle);
            await window.Olm.init({locateFile: () => olmPaths.wasm});
        } else {
            await addScript(olmPaths.legacyBundle);
            await window.Olm.init();
        }
        return window.Olm;
    }
    return null;
}
function relPath(path, basePath) {
    const idx = basePath.lastIndexOf("/");
    const dir = idx === -1 ? "" : basePath.slice(0, idx);
    const dirCount = dir.length ? dir.split("/").length : 0;
    return "../".repeat(dirCount) + path;
}
async function loadWorker(paths) {
    const workerPool = new WorkerPool(paths.worker, 4);
    await workerPool.init();
    const path = relPath(paths.olm.legacyBundle, paths.worker);
    await workerPool.sendAll({type: "load_olm", path});
    return workerPool;
}
async function main(container, paths) {
    try {
        const clock = new Clock();
        let request;
        if (typeof fetch === "function") {
            request = createFetchRequest(clock.createTimeout);
        } else {
            request = xhrRequest;
        }
        const sessionInfoStorage = new SessionInfoStorage("brawl_sessions_v1");
        const storageFactory = new StorageFactory();
        let workerPromise;
        if (!window.WebAssembly) {
            workerPromise = loadWorker(paths);
        }
        const vm = new BrawlViewModel({
            createSessionContainer: () => {
                return new SessionContainer({
                    random: Math.random,
                    onlineStatus: new OnlineStatus(),
                    storageFactory,
                    sessionInfoStorage,
                    request,
                    clock,
                    olmPromise: loadOlm(paths.olm),
                    workerPromise,
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

export { main };

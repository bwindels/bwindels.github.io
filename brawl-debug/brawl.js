var main = (function () {
    'use strict';

    class HomeServerError extends Error {
        constructor(method, url, body) {
            super(`${body.error} on ${method} ${url}`);
            this.errcode = body.errcode;
            this.retry_after_ms = body.retry_after_ms;
        }

        get isFatal() {
            switch (this.errcode) {
                
            }
        }
    }

    class RequestAbortError extends Error {
    }

    class NetworkError extends Error { 
    }

    class RequestWrapper {
        constructor(method, url, requestResult) {
            this._requestResult = requestResult;
            this._promise = this._requestResult.response().then(response => {
                // ok?
                if (response.status >= 200 && response.status < 300) {
                    return response.body;
                } else {
                    switch (response.status) {
                        default:
                            throw new HomeServerError(method, url, response.body);
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
        constructor({homeServer, accessToken, request}) {
            // store these both in a closure somehow so it's harder to get at in case of XSS?
            // one could change the homeserver as well so the token gets sent there, so both must be protected from read/write
            this._homeserver = homeServer;
            this._accessToken = accessToken;
            this._requestFn = request;
        }

        _url(csPath) {
            return `${this._homeserver}/_matrix/client/r0${csPath}`;
        }

        _request(method, csPath, queryParams = {}, body) {
            const queryString = Object.entries(queryParams)
                .filter(([, value]) => value !== undefined)
                .map(([name, value]) => {
                    if (typeof value === "object") {
                        value = JSON.stringify(value);
                    }
                    return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
                })
                .join("&");
            const url = this._url(`${csPath}?${queryString}`);
            let bodyString;
            const headers = new Headers();
            if (this._accessToken) {
                headers.append("Authorization", `Bearer ${this._accessToken}`);
            }
            headers.append("Accept", "application/json");
            if (body) {
                headers.append("Content-Type", "application/json");
                bodyString = JSON.stringify(body);
            }
            const requestResult = this._requestFn(url, {
                method,
                headers,
                body: bodyString,
            });
            return new RequestWrapper(method, url, requestResult);
        }

        _post(csPath, queryParams, body) {
            return this._request("POST", csPath, queryParams, body);
        }

        _put(csPath, queryParams, body) {
            return this._request("PUT", csPath, queryParams, body);
        }

        _get(csPath, queryParams, body) {
            return this._request("GET", csPath, queryParams, body);
        }

        sync(since, filter, timeout) {
            return this._get("/sync", {since, timeout, filter});
        }

        // params is from, dir and optionally to, limit, filter.
        messages(roomId, params) {
            return this._get(`/rooms/${encodeURIComponent(roomId)}/messages`, params);
        }

        send(roomId, eventType, txnId, content) {
            return this._put(`/rooms/${encodeURIComponent(roomId)}/send/${encodeURIComponent(eventType)}/${encodeURIComponent(txnId)}`, {}, content);
        }

        passwordLogin(username, password) {
            return this._post("/login", undefined, {
              "type": "m.login.password",
              "identifier": {
                "type": "m.id.user",
                "user": username
              },
              "password": password
            });
        }

        createFilter(userId, filter) {
            return this._post(`/user/${encodeURIComponent(userId)}/filter`, undefined, filter);
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
        const promise = fetch(url, options).then(async response => {
            const {status} = response;
            const body = await response.json();
            return {status, body};
        }, err => {
            if (err.name === "AbortError") {
                throw new RequestAbortError();
            } else if (err instanceof TypeError) {
                // Network errors are reported as TypeErrors, see
                // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful
                // this can either mean user is offline, server is offline, or a CORS error (server misconfiguration).
                // 
                // One could check navigator.onLine to rule out the first
                // but the 2 later ones are indistinguishable from javascript.
                throw new NetworkError(`${options.method} ${url}: ${err.message}`);
            }
            throw err;
        });
        return new RequestResult(promise, controller);
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

    var Platform = {
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
            return new EventKey(this.fragmentId + 1, Platform.middleStorageKey);
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
            return new EventKey(Platform.maxStorageKey, Platform.maxStorageKey);
        }

        static get minKey() {
            return new EventKey(Platform.minStorageKey, Platform.minStorageKey);
        }

        static get defaultLiveKey() {
            return new EventKey(Platform.minStorageKey, Platform.middleStorageKey);
        }

        toString() {
            return `[${this.fragmentId}/${this.eventIndex}]`;
        }
    }
    //#endif

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
                        encodeKey(roomId, this._lower.fragmentId, Platform.maxStorageKey),
                        this._lowerOpen,
                        false
                    );
                }
                // upperBound
                // also bound as we don't want to move into another roomId
                if (!this._lower && this._upper) {
                    return IDBKeyRange.bound(
                        encodeKey(roomId, this._upper.fragmentId, Platform.minStorageKey),
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

    class RoomFragmentStore {
        constructor(store) {
            this._store = store;
        }

        _allRange(roomId) {
            try {
                return IDBKeyRange.bound(
                    encodeKey$1(roomId, Platform.minStorageKey),
                    encodeKey$1(roomId, Platform.maxStorageKey)
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
                encodeKey$2(roomId, Platform.minStorageKey),
                encodeKey$2(roomId, Platform.maxStorageKey),
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
            return this._store("timelineFragments", idbStore => new RoomFragmentStore(idbStore));
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

    class SessionsStore {
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
    //#endif

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
                return Platform.minStorageKey;
            } else {
                return Platform.maxStorageKey;
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
            this._fragmentIdComparer.add(newFragment);
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
    //#endif

    class BaseObservableCollection {
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
                if (handler) {
                    this._handlers.delete(handler);
                    if (this._handlers.size === 0) {
                        this.onUnsubscribeLast();
                    }
                    handler = null;
                }
                return null;
            };
        }

        // Add iterator over handlers here
    }

    class BaseObservableList extends BaseObservableCollection {
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

    class BaseObservableMap extends BaseObservableCollection {
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
    //#endif

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
    //#endif

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

    class GapWriter {
        constructor({roomId, storage, fragmentIdComparer}) {
            this._roomId = roomId;
            this._storage = storage;
            this._fragmentIdComparer = fragmentIdComparer;
        }
        // events is in reverse-chronological order (last event comes at index 0) if backwards
        async _findOverlappingEvents(fragmentEntry, events, txn) {
            const eventIds = events.map(e => e.event_id);
            let nonOverlappingEvents = events;
            let neighbourFragmentEntry;
            const neighbourEventId = await txn.timelineEvents.findFirstOccurringEventId(this._roomId, eventIds);
            if (neighbourEventId) {
                // trim overlapping events
                const neighbourEventIndex = events.findIndex(e => e.event_id === neighbourEventId);
                nonOverlappingEvents = events.slice(0, neighbourEventIndex);
                // get neighbour fragment to link it up later on
                const neighbourEvent = await txn.timelineEvents.getByEventId(this._roomId, neighbourEventId);
                const neighbourFragment = await txn.timelineFragments.get(this._roomId, neighbourEvent.fragmentId);
                neighbourFragmentEntry = fragmentEntry.createNeighbourEntry(neighbourFragment);
            }
            return {nonOverlappingEvents, neighbourFragmentEntry};
        }

        async _findLastFragmentEventKey(fragmentEntry, txn) {
            const {fragmentId, direction} = fragmentEntry;
            if (direction.isBackward) {
                const [firstEvent] = await txn.timelineEvents.firstEvents(this._roomId, fragmentId, 1);
                return new EventKey(firstEvent.fragmentId, firstEvent.eventIndex);
            } else {
                const [lastEvent] = await txn.timelineEvents.lastEvents(this._roomId, fragmentId, 1);
                return new EventKey(lastEvent.fragmentId, lastEvent.eventIndex);
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
            directionalAppend(entries, fragmentEntry, direction);
            // set `end` as token, and if we found an event in the step before, link up the fragments in the fragment entry
            if (neighbourFragmentEntry) {
                fragmentEntry.linkedFragmentId = neighbourFragmentEntry.fragmentId;
                neighbourFragmentEntry.linkedFragmentId = fragmentEntry.fragmentId;
                // if neighbourFragmentEntry was found, it means the events were overlapping,
                // so no pagination should happen anymore.
                neighbourFragmentEntry.token = null;
                fragmentEntry.token = null;

                txn.timelineFragments.update(neighbourFragmentEntry.fragment);
                directionalAppend(entries, neighbourFragmentEntry, direction);

                // update fragmentIdComparer here after linking up fragments
                this._fragmentIdComparer.add(fragmentEntry.fragment);
                this._fragmentIdComparer.add(neighbourFragmentEntry.fragment);
            } else {
                fragmentEntry.token = end;
            }
            txn.timelineFragments.update(fragmentEntry.fragment);
        }

        async writeFragmentFill(fragmentEntry, response) {
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

            const txn = await this._storage.readWriteTxn([
                this._storage.storeNames.timelineEvents,
                this._storage.storeNames.timelineFragments,
            ]);

            try {
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
                let lastKey = await this._findLastFragmentEventKey(fragmentEntry, txn);
                // find out if any event in chunk is already present using findFirstOrLastOccurringEventId
                const {
                    nonOverlappingEvents,
                    neighbourFragmentEntry
                } = await this._findOverlappingEvents(fragmentEntry, chunk, txn);

                // create entries for all events in chunk, add them to entries
                entries = this._storeEvents(nonOverlappingEvents, lastKey, direction, txn);
                await this._updateFragments(fragmentEntry, neighbourFragmentEntry, end, entries, txn);
            } catch (err) {
                txn.abort();
                throw err;
            }

            await txn.complete();

            return entries;
        }
    }
    //#endif

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
        constructor({roomId, storage, closeCallback, fragmentIdComparer, pendingEvents, user, hsApi}) {
            this._roomId = roomId;
            this._storage = storage;
            this._closeCallback = closeCallback;
            this._fragmentIdComparer = fragmentIdComparer;
            this._hsApi = hsApi;
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

        /** @package */
        appendLiveEntries(newEntries) {
            this._remoteEntries.setManySorted(newEntries);
        }

        /** @public */
        async fillGap(fragmentEntry, amount) {
            const response = await this._hsApi.messages(this._roomId, {
                from: fragmentEntry.token,
                dir: fragmentEntry.direction.asApiString(),
                limit: amount,
                filter: {lazy_load_members: true}
            }).response();
            const gapWriter = new GapWriter({
                roomId: this._roomId,
                storage: this._storage,
                fragmentIdComparer: this._fragmentIdComparer
            });
            const newEntries = await gapWriter.writeFragmentFill(fragmentEntry, response);
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
            this._closeCallback();
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

        add(fragment) {
            this._fragmentsById.set(fragment.id, fragment);
            this.rebuild(this._fragmentsById.values());
        }
    }
    //#endif

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
                    this._amountSent += 1;
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
                        );
                    });
                    pendingEvent.remoteId = response.event_id;
                    // 
                    console.log("writing remoteId now");
                    await this._tryUpdateEvent(pendingEvent);
                    console.log("keep sending?", this._amountSent, "<", this._pendingEvents.length);
                }
            } catch(err) {
                if (err instanceof NetworkError) {
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
                if (txnId) {
                    const idx = this._pendingEvents.array.findIndex(pe => pe.txnId === txnId);
                    if (idx !== -1) {
                        const pendingEvent = this._pendingEvents.get(idx);
                        txn.pendingEvents.remove(pendingEvent.roomId, pendingEvent.queueIndex);
                        removed.push(pendingEvent);
                    }
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
            this._sendQueue.enqueueEvent(eventType, content);
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
            this._timeline = new Timeline({
                roomId: this.id,
                storage: this._storage,
                hsApi: this._hsApi,
                fragmentIdComparer: this._fragmentIdComparer,
                pendingEvents: this._sendQueue.pendingEvents,
                closeCallback: () => this._timeline = null,
                user: this._user,
            });
            await this._timeline.load();
            return this._timeline;
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
            await Platform.delay(retryAfterMs);
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
            this._offline = false;
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

        // this should really be per roomId to avoid head-of-line blocking
        // 
        // takes a callback instead of returning a promise with the slot
        // to make sure the scheduler doesn't get blocked by a slot that is not consumed
        request(sendCallback) {
            let request;
            const promise = new Promise((resolve, reject) => request = {resolve, reject, sendCallback});
            this._sendRequests.push(request);
            if (!this._sendScheduled && !this._offline) {
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
                    if (err instanceof NetworkError) {
                        // we're offline, everybody will have
                        // to re-request slots when we come back online
                        this._offline = true;
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

        notifyNetworkAvailable() {
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

    const INCREMENTAL_TIMEOUT = 30000;

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

    class Sync extends EventEmitter {
        constructor({hsApi, session, storage}) {
            super();
            this._hsApi = hsApi;
            this._session = session;
            this._storage = storage;
            this._isSyncing = false;
            this._currentRequest = null;
        }

        get isSyncing() {
            return this._isSyncing;
        }

        // returns when initial sync is done
        async start() {
            if (this._isSyncing) {
                return;
            }
            this._isSyncing = true;
            this.emit("status", "started");
            let syncToken = this._session.syncToken;
            // do initial sync if needed
            if (!syncToken) {
                // need to create limit filter here
                syncToken = await this._syncRequest();
            }
            this._syncLoop(syncToken);
        }

        async _syncLoop(syncToken) {
            // if syncToken is falsy, it will first do an initial sync ... 
            while(this._isSyncing) {
                try {
                    console.log(`starting sync request with since ${syncToken} ...`);
                    syncToken = await this._syncRequest(syncToken, INCREMENTAL_TIMEOUT);
                } catch (err) {
                    this._isSyncing = false;
                    if (!(err instanceof RequestAbortError)) {
                        console.error("stopping sync because of error");
                        console.error(err);
                        this.emit("status", "error", err);
                    }
                }
            }
            this.emit("status", "stopped");
        }

        async _syncRequest(syncToken, timeout) {
            let {syncFilterId} = this._session;
            if (typeof syncFilterId !== "string") {
                syncFilterId = (await this._hsApi.createFilter(this._session.user.id, {room: {state: {lazy_load_members: true}}}).response()).filter_id;
            }
            this._currentRequest = this._hsApi.sync(syncToken, syncFilterId, timeout);
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
            if (!this._isSyncing) {
                return;
            }
            this._isSyncing = false;
            if (this._currentRequest) {
                this._currentRequest.abort();
                this._currentRequest = null;
            }
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

    // maps 1..n entries to 0..1 tile. Entries are what is stored in the timeline, either an event or fragmentboundary
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
                    currentTile = this._tileCreator(entry, this._emitSpontanousUpdate);
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

            const newTile = this._tileCreator(entry, this._emitSpontanousUpdate);
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

    class SimpleTile {
        constructor({entry, emitUpdate}) {
            this._entry = entry;
            this._emitUpdate = emitUpdate;
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
        // TilesCollection contract? unused atm
        get upperEntry() {
            return this._entry;
        }

        // TilesCollection contract? unused atm
        get lowerEntry() {
            return this._entry;
        }

        emitUpdate(paramName) {
            this._emitUpdate(this, paramName);
        }

        // TilesCollection contract
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

        get internalId() {
            return this._entry.asEventKey().toString();
        }

        get isPending() {
            return this._entry.isPending;
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

    class RoomNameTile$1 extends SimpleTile {

        get shape() {
            return "announcement";
        }

        get announcement() {
            const {sender, content, stateKey} = this._entry;
            switch (content.membership) {
                case "invite": return `${stateKey} was invited to the room by ${sender}`;
                case "join": return `${stateKey} joined the room`;
                case "leave": {
                    if (stateKey === sender) {
                        return `${stateKey} left the room`;
                    } else {
                        const reason = content.reason;
                        return `${stateKey} was kicked from the room by ${sender}${reason ? `: ${reason}` : ""}`;
                    }
                }
                case "ban": return `${stateKey} was banned from the room by ${sender}`;
                default: return `${sender} membership changed to ${content.membership}`;
            }
        }
    }

    function tilesCreator ({timeline, ownUserId}) {
        return function tilesCreator(entry, emitUpdate) {
            const options = {entry, emitUpdate, ownUserId};
            if (entry.isGap) {
                return new GapTile(options, timeline);
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
                                return null; // not supported yet
                                // return new ImageTile(options);
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
                        return new RoomNameTile$1(options);
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
        constructor(timeline, ownUserId) {
            this._timeline = timeline;
            // once we support sending messages we could do
            // timeline.entries.concat(timeline.pendingEvents)
            // for an ObservableList that also contains local echos
            this._tiles = new TilesCollection(timeline.entries, tilesCreator({timeline, ownUserId}));
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

    class RoomViewModel extends EventEmitter {
        constructor({room, ownUserId, closeCallback}) {
            super();
            this._room = room;
            this._ownUserId = ownUserId;
            this._timeline = null;
            this._timelineVM = null;
            this._onRoomChange = this._onRoomChange.bind(this);
            this._timelineError = null;
            this._closeCallback = closeCallback;
        }

        async load() {
            this._room.on("change", this._onRoomChange);
            try {
                this._timeline = await this._room.openTimeline();
                this._timelineVM = new TimelineViewModel(this._timeline, this._ownUserId);
                this.emit("change", "timelineViewModel");
            } catch (err) {
                console.error(`room.openTimeline(): ${err.message}:\n${err.stack}`);
                this._timelineError = err;
                this.emit("change", "error");
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
            this.emit("change", "name");
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
            return "";
        }

        get avatarInitials() {
            return avatarInitials(this._room.name);
        }

        sendMessage(message) {
            if (message) {
                try {
                    this._room.sendEvent("m.room.message", {msgtype: "m.text", body: message});
                } catch (err) {
                    console.error(`room.sendMessage(): ${err.message}:\n${err.stack}`);
                    this._timelineError = err;
                    this.emit("change", "error");
                    return false;
                }
                return true;
            }
            return false;
        }
    }

    class SyncStatusViewModel extends EventEmitter {
        constructor(sync) {
            super();
            this._sync = sync;
            this._onStatus = this._onStatus.bind(this);
        }

        _onStatus(status, err) {
            if (status === "error") {
                this._error = err;
            } else if (status === "started") {
                this._error = null;
            }
            this.emit("change");
        }

        onFirstSubscriptionAdded(name) {
            if (name === "change") {
                this._sync.on("status", this._onStatus);
            }
        }

        onLastSubscriptionRemoved(name) {
            if (name === "change") {
                this._sync.on("status", this._onStatus);
            }
        }

        trySync() {
            this._sync.start();
            this.emit("change");
        }

        get status() {
            if (!this.isSyncing) {
                if (this._error) {
                    return `Error while syncing: ${this._error.message}`;
                } else {
                    return "Sync stopped";
                }
            } else {
                return "Sync running";
            }
        }

        get isSyncing() {
            return this._sync.isSyncing;
        }
    }

    class SessionViewModel extends EventEmitter {
        constructor({session, sync}) {
            super();
            this._session = session;
            this._syncStatusViewModel = new SyncStatusViewModel(sync);
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

        get syncStatusViewModel() {
            return this._syncStatusViewModel;
        }

        get roomList() {
            return this._roomList;
        }

        get currentRoom() {
            return this._currentRoomViewModel;
        }

        _closeCurrentRoom() {
            if (this._currentRoomViewModel) {
                this._currentRoomViewModel.dispose();
                this._currentRoomViewModel = null;
                this.emit("change", "currentRoom");
            }
        }

        _openRoom(room) {
            if (this._currentRoomViewModel) {
                this._currentRoomViewModel.dispose();
            }
            this._currentRoomViewModel = new RoomViewModel({
                room,
                ownUserId: this._session.user.id,
                closeCallback: () => this._closeCurrentRoom(),
            });
            this._currentRoomViewModel.load();
            this.emit("change", "currentRoom");
        }
    }

    class LoginViewModel extends EventEmitter {
        constructor({loginCallback, defaultHomeServer, createHsApi}) {
            super();
            this._loginCallback = loginCallback;
            this._defaultHomeServer = defaultHomeServer;
            this._createHsApi = createHsApi;
            this._loading = false;
            this._error = null;
        }

        get usernamePlaceholder() { return "Username"; }
        get passwordPlaceholder() { return "Password"; }
        get hsPlaceholder() { return "Your matrix homeserver"; }
        get defaultHomeServer() { return this._defaultHomeServer; }
        get error() { return this._error; }
        get loading() { return this._loading; }

        async login(username, password, homeserver) {
            const hsApi = this._createHsApi(homeserver);
            try {
                this._loading = true;
                this.emit("change", "loading");
                const loginData = await hsApi.passwordLogin(username, password).response();
                loginData.homeServerUrl = homeserver;
                this._loginCallback(loginData);
                // wait for parent view model to switch away here
            } catch (err) {
                this._error = err;
                this._loading = false;
                this.emit("change", "loading");
            }
        }

        cancel() {
            this._loginCallback();
        }
    }

    class SessionItemViewModel extends EventEmitter {
        constructor(sessionInfo, pickerVM) {
            super();
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
            this.emit("change", "isDeleting");
            try {
                await this._pickerVM.delete(this.id);
            } catch(err) {
                this._error = err;
                console.error(err);
                this.emit("change", "error");
            } finally {
                this._isDeleting = false;
                this.emit("change", "isDeleting");
            }
        }

        async clear() {
            this._isClearing = true;
            this.emit("change");
            try {
                await this._pickerVM.clear(this.id);
            } catch(err) {
                this._error = err;
                console.error(err);
                this.emit("change", "error");
            } finally {
                this._isClearing = false;
                this.emit("change", "isClearing");
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
                this.emit("change", "exportDataUrl");
            } catch (err) {
                alert(err.message);
                console.error(err);
            }
        }

        clearExport() {
            if (this._exportDataUrl) {
                URL.revokeObjectURL(this._exportDataUrl);
                this._exportDataUrl = null;
                this.emit("change", "exportDataUrl");
            }
        }
    }

    class SessionPickerViewModel {
        constructor({storageFactory, sessionStore, sessionCallback}) {
            this._storageFactory = storageFactory;
            this._sessionStore = sessionStore;
            this._sessionCallback = sessionCallback;
            this._sessions = new SortedArray((s1, s2) => s1.id.localeCompare(s2.id));
        }

        async load() {
            const sessions = await this._sessionStore.getAll();
            this._sessions.setManyUnsorted(sessions.map(s => new SessionItemViewModel(s, this)));
        }

        pick(id) {
            const sessionVM = this._sessions.array.find(s => s.id === id);
            if (sessionVM) {
                this._sessionCallback(sessionVM.sessionInfo);
            }
        }

        async _exportData(id) {
            const sessionInfo = await this._sessionStore.get(id);
            const stores = await this._storageFactory.export(id);
            const data = {sessionInfo, stores};
            return data;
        }

        async import(json) {
            const data = JSON.parse(json);
            const {sessionInfo} = data;
            sessionInfo.comment = `Imported on ${new Date().toLocaleString()} from id ${sessionInfo.id}.`;
            sessionInfo.id = createNewSessionId();
            await this._storageFactory.import(sessionInfo.id, data.stores);
            await this._sessionStore.add(sessionInfo);
            this._sessions.set(new SessionItemViewModel(sessionInfo, this));
        }

        async delete(id) {
            const idx = this._sessions.array.findIndex(s => s.id === id);
            await this._sessionStore.delete(id);
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
            this._sessionCallback();
        }
    }

    function createNewSessionId() {
        return (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString();
    }

    class BrawlViewModel extends EventEmitter {
        constructor({storageFactory, sessionStore, createHsApi, clock}) {
            super();
            this._storageFactory = storageFactory;
            this._sessionStore = sessionStore;
            this._createHsApi = createHsApi;
            this._clock = clock;

            this._loading = false;
            this._error = null;
            this._sessionViewModel = null;
            this._loginViewModel = null;
            this._sessionPickerViewModel = null;
        }

        async load() {
            if (await this._sessionStore.hasAnySession()) {
                this._showPicker();
            } else {
                this._showLogin();
            }
        }

        async _showPicker() {
            this._clearSections();
            this._sessionPickerViewModel = new SessionPickerViewModel({
                sessionStore: this._sessionStore,
                storageFactory: this._storageFactory,
                sessionCallback: sessionInfo => this._onSessionPicked(sessionInfo)
            });
            this.emit("change", "activeSection");
            try {
                await this._sessionPickerViewModel.load();
            } catch (err) {
                this._clearSections();
                this._error = err;
                this.emit("change", "activeSection");
            }
        }

        _showLogin() {
            this._clearSections();
            this._loginViewModel = new LoginViewModel({
                createHsApi: this._createHsApi,
                defaultHomeServer: "https://matrix.org",
                loginCallback: loginData => this._onLoginFinished(loginData)
            });
            this.emit("change", "activeSection");

        }

        _showSession(session, sync) {
            this._clearSections();
            this._sessionViewModel = new SessionViewModel({session, sync});
            this.emit("change", "activeSection");
        }

        _clearSections() {
            this._error = null;
            this._loading = false;
            this._sessionViewModel = null;
            this._loginViewModel = null;
            this._sessionPickerViewModel = null;
        }

        get activeSection() {
            if (this._error) {
                return "error";
            } else if(this._loading) {
                return "loading";
            } else if (this._sessionViewModel) {
                return "session";
            } else if (this._loginViewModel) {
                return "login";
            } else {
                return "picker";
            }
        }

        get loadingText() { return this._loadingText; }
        get sessionViewModel() { return this._sessionViewModel; }
        get loginViewModel() { return this._loginViewModel; }
        get sessionPickerViewModel() { return this._sessionPickerViewModel; }
        get errorText() { return this._error && this._error.message; }

        async _onLoginFinished(loginData) {
            if (loginData) {
                // TODO: extract random() as it is a source of non-determinism
                const sessionId = createNewSessionId();
                const sessionInfo = {
                    id: sessionId,
                    deviceId: loginData.device_id,
                    userId: loginData.user_id,
                    homeServer: loginData.homeServerUrl,
                    accessToken: loginData.access_token,
                    lastUsed: this._clock.now()
                };
                await this._sessionStore.add(sessionInfo);
                this._loadSession(sessionInfo);
            } else {
                this._showPicker();
            }
        }

        _onSessionPicked(sessionInfo) {
            if (sessionInfo) {
                this._loadSession(sessionInfo);
                this._sessionStore.updateLastUsed(sessionInfo.id, this._clock.now());
            } else {
                this._showLogin();
            }
        }

        async _loadSession(sessionInfo) {
            try {
                this._loading = true;
                this._loadingText = "Loading your conversations…";
                const hsApi = this._createHsApi(sessionInfo.homeServer, sessionInfo.accessToken);
                const storage = await this._storageFactory.create(sessionInfo.id);
                // no need to pass access token to session
                const filteredSessionInfo = {
                    deviceId: sessionInfo.deviceId,
                    userId: sessionInfo.userId,
                    homeServer: sessionInfo.homeServer,
                };
                const session = new Session({storage, sessionInfo: filteredSessionInfo, hsApi});
                // show spinner now, with title loading stored data?

                this.emit("change", "activeSection");
                await session.load();
                const sync = new Sync({hsApi, storage, session});            
                
                const needsInitialSync = !session.syncToken;
                if (!needsInitialSync) {
                    this._showSession(session, sync);
                }
                this._loadingText = "Getting your conversations from the server…";
                this.emit("change", "loadingText");
                // update spinner title to initial sync
                await sync.start();
                if (needsInitialSync) {
                    this._showSession(session, sync);
                }
                // start sending pending messages
                session.notifyNetworkAvailable();
            } catch (err) {
                console.error(err);
                this._error = err;
            }
            this.emit("change", "activeSection");
        }
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

    function el(elementName, attributes, children) {
        if (attributes && isChildren(attributes)) {
            children = attributes;
            attributes = null;
        }

        const e = document.createElement(elementName);

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

    const TAG_NAMES = [
        "a", "ol", "ul", "li", "div", "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "strong", "em", "span", "img", "section", "main", "article", "aside",
        "pre", "button", "time", "input", "textarea"];

    const tag = {};

    for (const tagName of TAG_NAMES) {
        tag[tagName] = function(attributes, children) {
            return el(tagName, attributes, children);
        };
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
        constructor({list, onItemClick, className}, childCreator) {
            this._onItemClick = onItemClick;
            this._list = list;
            this._className = className;
            this._root = null;
            this._subscription = null;
            this._childCreator = childCreator;
            this._childInstances = null;
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
            this._unloadList();
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
                const childDomNode = child.mount();
                this._root.appendChild(childDomNode);
            }
        }

        onAdd(idx, value) {
            this.onBeforeListChanged();
            const child = this._childCreator(value);
            this._childInstances.splice(idx, 0, child);
            insertAt(this._root, idx, child.mount());
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
        missing:
            - create views
    */
    class Template {
        constructor(value, render) {
            this._value = value;
            this._eventListeners = null;
            this._bindings = null;
            this._subTemplates = null;
            this._root = render(this, this._value);
            this._attach();
        }

        root() {
            return this._root;
        }

        update(value) {
            this._value = value;
            if (this._bindings) {
                for (const binding of this._bindings) {
                    binding();
                }
            }
            if (this._subTemplates) {
                for (const sub of this._subTemplates) {
                    sub.update(value);
                }
            }
        }

        dispose() {
            if (this._eventListeners) {
                for (let {node, name, fn} of this._eventListeners) {
                    node.removeEventListener(name, fn);
                }
            }
            if (this._subTemplates) {
                for (const sub of this._subTemplates) {
                    sub.dispose();
                }
            }
        }

        _attach() {
            if (this._eventListeners) {
                for (let {node, name, fn} of this._eventListeners) {
                    node.addEventListener(name, fn);
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

        _addSubTemplate(t) {
            if (!this._subTemplates) {
                this._subTemplates = [];
            }
            this._subTemplates.push(t);
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
            this._addBinding(binding);
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

            this._addBinding(binding);
            return node;
        }

        el(name, attributes, children) {
            if (attributes && isChildren(attributes)) {
                children = attributes;
                attributes = null;
            }

            const node = document.createElement(name);
            
            if (attributes) {
                this._setNodeAttributes(node, attributes);
            }
            if (children) {
                this._setNodeChildren(node, children);
            }

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
                    this._addEventListener(node, eventName, handler);
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
            this._addBinding(binding);
            return node;
        }

        // creates a conditional subtemplate
        if(fn, render) {
            const boolFn = value => !!fn(value);
            return this._addReplaceNodeBinding(boolFn, (prevNode) => {
                if (prevNode && prevNode.nodeType !== Node.COMMENT_NODE) {
                    const templateIdx = this._subTemplates.findIndex(t => t.root() === prevNode);
                    const [template] = this._subTemplates.splice(templateIdx, 1);
                    template.dispose();
                }
                if (boolFn(this._value)) {
                    const template = new Template(this._value, render);
                    this._addSubTemplate(template);
                    return template.root();
                } else {
                    return document.createComment("if placeholder");
                }
            });
        }
    }

    for (const tag of TAG_NAMES) {
        Template.prototype[tag] = function(attributes, children) {
            return this.el(tag, attributes, children);
        };
    }

    class TemplateView {
        constructor(vm, bindToChangeEvent) {
            this.viewModel = vm;
            this._changeEventHandler = bindToChangeEvent ? this.update.bind(this, this.viewModel) : null;
            this._template = null;
        }

        render() {
            throw new Error("render not implemented");
        }

        mount() {
            if (this._changeEventHandler) {
                this.viewModel.on("change", this._changeEventHandler);
            }
            this._template = new Template(this.viewModel, (t, value) => this.render(t, value));
            return this.root();
        }

        root() {
            return this._template.root();
        }

        unmount() {
            if (this._changeEventHandler) {
                this.viewModel.off("change", this._changeEventHandler);
            }
            this._template.dispose();
            this._template = null;
        }

        update(value, prop) {
            if (this._template) {
                this._template.update(value);
            }
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
            this.viewModel.open();
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
                    onClick: () => this.viewModel.fill(),
                    disabled: vm => vm.isLoading
                }, label),
                t.if(vm => vm.error, t => t.strong(vm => vm.error))
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
                    case "message":return new TextMessageView(entry);
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
                if (this.viewModel.sendMessage(this._input.value)) {
                    this._input.value = "";
                }
            }
        }
    }

    class RoomView extends TemplateView {
        constructor(viewModel) {
            super(viewModel, true);
            this._timelineList = null;
        }

        render(t, vm) {
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
                    this._timelineList.mount(),
                    this._composer.mount(),
                ])
            ]);
        }

        mount() {
            this._composer = new MessageComposer(this.viewModel);
            this._timelineList = new TimelineList();
            return super.mount();
        }

        unmount() {
            this._composer.unmount();
            this._timelineList.unmount();
            super.unmount();
        }

        update(value, prop) {
            super.update(value, prop);
            if (prop === "timelineViewModel") {
                this._timelineList.update({viewModel: this.viewModel.timelineViewModel});
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
            const newRoot = this._childView.mount();
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

    class SyncStatusBar extends TemplateView {
        constructor(vm) {
            super(vm, true);
        }

        render(t, vm) {
            return t.div({className: {
                "SyncStatusBar": true,
                "SyncStatusBar_shown": true,
            }}, [
                vm => vm.status,
                t.if(vm => !vm.isSyncing, t => t.button({onClick: () => vm.trySync()}, "Try syncing")),
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
            this._syncStatusBar = new SyncStatusBar(this._viewModel.syncStatusViewModel);
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
                this._syncStatusBar.mount(),
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

    class LoginView extends TemplateView {
        constructor(vm) {
            super(vm, true);
        }

        render(t, vm) {
            const username = t.input({type: "text", placeholder: vm.usernamePlaceholder});
            const password = t.input({type: "password", placeholder: vm.passwordPlaceholder});
            const homeserver = t.input({type: "text", placeholder: vm.hsPlaceholder, value: vm.defaultHomeServer});
            return t.div({className: "LoginView form"}, [
                t.h1(["Log in to your homeserver"]),
                t.if(vm => vm.error, t => t.div({className: "error"}, vm => vm.error)),
                t.div(username),
                t.div(password),
                t.div(homeserver),
                t.div(t.button({
                    onClick: () => vm.login(username.value, password.value, homeserver.value),
                    disabled: vm => vm.loading
                }, "Log In")),
                t.div(t.button({onClick: () => vm.cancel()}, ["Pick an existing session"])),
                t.p(t.a({href: "https://github.com/bwindels/brawl-chat"}, ["Brawl on Github"]))
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
        constructor(vm) {
            super(vm, true);
        }

        _onDeleteClick() {
            if (confirm("Are you sure?")) {
                this.viewModel.delete();
            }
        }

        render(t) {
            const deleteButton = t.button({
                disabled: vm => vm.isDeleting,
                onClick: this._onDeleteClick.bind(this),
            }, "Delete");
            const clearButton = t.button({
                disabled: vm => vm.isClearing,
                onClick: () => this.viewModel.clear(),
            }, "Clear");
            const exportButton = t.button({
                disabled: vm => vm.isClearing,
                onClick: () => this.viewModel.export(),
            }, "Export");
            const downloadExport = t.if(vm => vm.exportDataUrl, (t, vm) => {
                return t.a({
                    href: vm.exportDataUrl,
                    download: `brawl-session-${this.viewModel.id}.json`,
                    onClick: () => setTimeout(() => this.viewModel.clearExport(), 100),
                }, "Download");
            });

            const userName = t.span({className: "userId"}, vm => vm.label);
            const errorMessage = t.if(vm => vm.error, t => t.span({className: "error"}, vm => vm.error));
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
        mount() {
            this._sessionList = new ListView({
                list: this.viewModel.sessions,
                onItemClick: (item, event) => {
                    if (event.target.closest(".userId")) {
                        this.viewModel.pick(item.viewModel.id);
                    }
                },
            }, sessionInfo => {
                return new SessionPickerItemView(sessionInfo);
            });
            return super.mount();
        }

        render(t) {
            return t.div({className: "SessionPickerView"}, [
                t.h1(["Pick a session"]),
                this._sessionList.mount(),
                t.p(t.button({onClick: () => this.viewModel.cancel()}, ["Log in to a new session instead"])),
                t.p(t.button({onClick: async () => this.viewModel.import(await selectFileAsText("application/json"))}, "Import")),
                t.p(t.a({href: "https://github.com/bwindels/brawl-chat"}, ["Brawl on Github"]))
            ]);
        }

        unmount() {
            super.unmount();
            this._sessionList.unmount();
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
                case "loading":
                    return new StatusView({header: "Loading", message: this._vm.loadingText});
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
            const vm = new BrawlViewModel({
                storageFactory: new StorageFactory(),
                createHsApi: (homeServer, accessToken = null) => new HomeServerApi({homeServer, accessToken, request}),
                sessionStore: new SessionsStore("brawl_sessions_v1"),
                clock: Date //just for `now` fn
            });
            await vm.load();
            const view = new BrawlView(vm);
            container.appendChild(view.mount());
        } catch(err) {
            console.error(`${err.message}:\n${err.stack}`);
        }
    }

    return main;

}());

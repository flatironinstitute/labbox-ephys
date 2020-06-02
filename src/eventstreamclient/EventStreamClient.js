import axios from 'axios'
// crypto cannot be imported for react native android
// import crypto from 'crypto';
import sha1 from 'js-sha1';

class EventStreamClient {
    constructor(url, channel, password, opts) {
        this._url = url;
        this._channel = channel;
        this._opts = opts || {};
        this._streams = {};
        this._webSocketStatus = null;
        this._webSocket = null;
        if ((typeof (password) === 'object') && ('env' in password)) {
            const p = process.env[password.env];
            if (!p) {
                throw Error(`Environment variable not set: ${password.env}`);
            }
            password = p;
        }
        this._password = password;
        this._webSocket = null;
        if (this._opts.useWebSocket) {
            
        }
    }
    async _initializeWebSocketIfNeeded() {
        if (this._webSocketStatus === 'initialized') {
            return;
        }
        if (this._webSocketStatus === 'initializing') {
            while (this._webSocketStatus != 'initialized') {
                await sleepMsec(100);
            }
            return;
        }
        this._webSocketStatus = 'initializing';
        if (!this._opts.webSocketUrl) {
            throw Error('Missing option: webSocketUrl');
        }
        this._webSocket = new window.WebSocket(this._opts.webSocketUrl);
        this._webSocket.onmessage = (e => {
            const msg = JSON.parse(e.data);
            if (msg.name === 'response') {
                const streamId = msg.streamId;
                if (streamId in this._streams) {
                    this._streams[streamId]._handleWebSocketResponse(msg);
                }
            }
        });
        await new Promise(resolve => {
            this._webSocket.onopen = (e => {
                resolve();
            });
        });
        this._webSocketStatus = 'initialized';
    }
    getStream(streamId) {
        if (typeof (streamId) === 'object') {
            streamId = sha1OfObject(streamId);
        }
        if (streamId in this._streams) {
            return this._streams[streamId];
        }
        const X = new EventStream(this, streamId);
        this._streams[streamId] = X;
        return X;
    }
}

class EventStream {
    constructor(parentClient, streamId) {
        this._parentClient = parentClient;
        this._serverUrl = parentClient._url;
        this._channel = parentClient._channel;
        this._password = parentClient._password;
        this._streamId = streamId;
        this._position = 0;
        this._opts = parentClient._opts || {};
        this._responses = {};
    }
    setPosition(position) {
        this._position = position;
    }
    async gotoEnd() {
        const numEvents = await this.getNumEvents();
        this.setPosition(numEvents);
    }
    async readEvents(waitMsec) {
        let result = null;
        if (!this._opts.useWebSocket) {
            const signature = sha1OfObject({
                // keys in alphabetical order
                password: this._password,
                streamId: this._streamId,
                taskName: "readEvents"
            })
            const url = `${this._serverUrl}/readEvents/${this._streamId}/${this._position}`;
            result = await axios.post(url, { channel: this._channel, signature: signature, waitMsec: waitMsec });
            result = result.data;
        }
        else {
            const requestId = randomString(10);
            const msg = {
                name: 'readEvents',
                streamId: this._streamId,
                requestId: requestId,
                position: this._position,
                waitMsec: waitMsec
            };
            await this._parentClient._initializeWebSocketIfNeeded();
            this._parentClient._webSocket.send(JSON.stringify(msg));
            while (!result) {
                await sleepMsec(100);
                if (requestId in this._responses) {
                    result = this._responses[requestId].result;
                    this._responses[requestId] = undefined; // does this delete it?
                }
            }
        }

        if (result.success) {
            if (result.newPosition !== this._position + result.events.length) {
                throw Error(`Unexpected new position in response from getEvents ${result.newPosition} <> ${this._position + result.events.length}`);
            }
            this._position = result.newPosition;
            return result.events;
        }
        else {
            throw Error(`Error getting events: ${result.error}`);
        }
    }
    _handleWebSocketResponse(response) {
        this._responses[response.requestId] = response;
    }
    async getNumEvents() {
        const signature = sha1OfObject({
            // keys in alphabetical order
            password: this._password,
            streamId: this._streamId,
            taskName: "getNumEvents"
        })
        const url = `${this._serverUrl}/getNumEvents/${this._streamId}`;
        let result = await axios.post(url, { channel: this._channel, signature: signature });
        if (result.data.success) {
            return result.data.numEvents;
        }
        else {
            throw Error(`Error getting num events: ${result.data.error}`);
        }
    }
    async writeEvent(event) {
        await this.writeEvents([event]);
    }
    async writeEvents(events) {
        const signature = sha1OfObject({
            // keys in alphabetical order
            password: this._password,
            streamId: this._streamId,
            taskName: "writeEvents"
        })
        const url = `${this._serverUrl}/writeEvents/${this._streamId}`;
        const result = await axios.post(url, { channel: this._channel, signature: signature, events: events });
        if (!result.data.success) {
            console.error(result.data);
            throw Error(`Error appending events.`);
        }
    }
}

// Use AsyncStorage from React Native
export const useAsyncStorage = (eventStream, AsyncStorage) => {
    const originalReadEvents = eventStream.readEvents;
    let last_timestamp_write_async_storage = 0;
    let loadedEvents = null;

    eventStream.readEvents = async () => {
        const pos0 = eventStream._position;
        if ((pos0 === 0) && (loadedEvents === null)) {
            loadedEvents = await getAsyncStorageItem(AsyncStorage, 'eventstream-' + eventStream._streamId, []);
        }
        if (pos0 < loadedEvents.length) {
            eventStream._position = loadedEvents.length;
            return loadedEvents.slice(pos0);
        }

        const events = await originalReadEvents();
        if (events.length > 0) {
            if (pos0 === loadedEvents.length) {
                for (let e of events) {
                    loadedEvents.push(e);
                }
                const elapsed = (new Date()) - last_timestamp_write_async_storage;
                if (elapsed > 3000) {
                    last_timestamp_write_async_storage = new Date();
                    await setAsyncStorageItem(AsyncStorage, 'eventstream-' + eventStream._streamId, loadedEvents);
                }
            }
        }
    }
}

function randomString(num_chars) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

const sleepMsec = m => new Promise(r => setTimeout(r, m));

async function getAsyncStorageItem(AsyncStorage, key, defaultValue) {
    try {
        const a = await AsyncStorage.getItem(key);
        return JSON.parse(a);
    }
    catch (err) {
        return defaultValue;
    }

}

async function setAsyncStorageItem(AsyncStorage, key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}

function sha1OfObject(obj) {
    return sha1(JSON.stringify(obj));
    // let shasum = crypto.createHash('sha1');
    // shasum.update(JSON.stringify(obj));
    // return shasum.digest('hex');
}

export default EventStreamClient;
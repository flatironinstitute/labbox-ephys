import axios from 'axios'
import crypto from 'crypto';

class EventStreamClient {
    constructor(url, channel, password) {
        this._url = url;
        this._channel = channel;
        if ((typeof(password) === 'object') && ('env' in password)) {
            const p = process.env[password.env];
            if (!p) {
                throw Error(`Environment variable not set: ${password.env}`);
            }
            password = p;
        }
        this._password = password;
    }
    getStream(streamId) {
        if (typeof(streamId) === 'object') {
            streamId = sha1OfObject(streamId);
        }
        return new EventStream(this._url, this._channel, this._password, streamId);
    }
}

class EventStream {
    constructor(url, channel, password, streamId) {
        this._serverUrl = url;
        this._channel = channel;
        this._password = password;
        this._streamId = streamId;
        this._position = 0;
    }
    setPosition(position) {
        this._position = position;
    }
    async readEvents(waitMsec) {
        const signature = sha1OfObject({
            // keys in alphabetical order
            password: this._password,
            streamId: this._streamId,
            taskName: "readEvents"
        })
        const url = `${this._serverUrl}/readEvents/${this._streamId}/${this._position}`;
        let result = await axios.post(url, {channel: this._channel, signature: signature, waitMsec: waitMsec});
        if (result.data.success) {
            if (result.data.newPosition !== this._position + result.data.events.length) {
                throw Error(`Unexpected new position in response from getEvents ${result.data.newPosition} <> ${this._position + result.data.events.length}`);
            }
            this._position = result.data.newPosition;
            return result.data.events;
        }
        else {
            throw Error(`Error getting events: ${result.data.error}`);
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
    let shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(obj));
    return shasum.digest('hex');
}

export default EventStreamClient;
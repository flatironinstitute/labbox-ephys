import {getNumMessages, getMessages, appendMessages} from './utils.js';

class FeedClient {
    constructor(feedId, opts) {
        this._feedId = feedId;
        this._opts = opts || {};
        this._subfeeds = {};
    }
    getSubfeed(subfeedName) {
        const k = _subfeedNameStr(subfeedName);
        if (k in this._subfeeds) {
            return this._subfeeds[k];
        }
        const X = new Subfeed(this, subfeedName);
        this._subfeeds[k] = X;
        return X;
    }
}

const _subfeedNameStr = (subfeedName) => {
    if (typeof(subfeedName) == 'string') {
        return subfeedName
    }
    else {
        return JSON.stringify(subfeedName);
    }
}

class Subfeed {
    constructor(parentClient, subfeedName) {
        this._parentClient = parentClient;
        this._feedId = parentClient._feedId;
        this._subfeedName = subfeedName;
        this._position = 0;
    }
    setPosition(position) {
        this._position = position;
    }
    async gotoEnd() {
        const numMessages = await this.getNumMessages();
        this.setPosition(numMessages);
    }
    async readMessages({waitMsec, maxNumMessages=10}) {
        const messages = await getMessages({
            feedId: this._feedId,
            subfeedName: this._subfeedName,
            position: this._position,
            maxNumMessages: maxNumMessages,
            waitMsec
        });
        this._position += messages.length;
        return messages;
    }
    async getNumMessages() {
        return await getNumMessages({feedId: this._feedId, subfeedName: this._subfeedName});
    }
    async appendMessage(message) {
        await this.appendMessages([message]);
    }
    async appendMessages(messages) {
        await appendMessages({
            feedId: this._feedId,
            subfeedName: this._subfeedName,
            messages
        });
    }
}

// // Use AsyncStorage from React Native
// export const useAsyncStorage = (eventStream, AsyncStorage) => {
//     const originalReadEvents = eventStream.readEvents;
//     let last_timestamp_write_async_storage = 0;
//     let loadedEvents = null;

//     eventStream.readEvents = async () => {
//         const pos0 = eventStream._position;
//         if ((pos0 === 0) && (loadedEvents === null)) {
//             loadedEvents = await getAsyncStorageItem(AsyncStorage, 'eventstream-' + eventStream._streamId, []);
//         }
//         if (pos0 < loadedEvents.length) {
//             eventStream._position = loadedEvents.length;
//             return loadedEvents.slice(pos0);
//         }

//         const events = await originalReadEvents();
//         if (events.length > 0) {
//             if (pos0 === loadedEvents.length) {
//                 for (let e of events) {
//                     loadedEvents.push(e);
//                 }
//                 const elapsed = (new Date()) - last_timestamp_write_async_storage;
//                 if (elapsed > 3000) {
//                     last_timestamp_write_async_storage = new Date();
//                     await setAsyncStorageItem(AsyncStorage, 'eventstream-' + eventStream._streamId, loadedEvents);
//                 }
//             }
//         }
//     }
// }

// function randomString(num_chars) {
//     var text = "";
//     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     for (var i = 0; i < num_chars; i++)
//         text += possible.charAt(Math.floor(Math.random() * possible.length));
//     return text;
// }

// const sleepMsec = m => new Promise(r => setTimeout(r, m));

// async function getAsyncStorageItem(AsyncStorage, key, defaultValue) {
//     try {
//         const a = await AsyncStorage.getItem(key);
//         return JSON.parse(a);
//     }
//     catch (err) {
//         return defaultValue;
//     }

// }

// async function setAsyncStorageItem(AsyncStorage, key, value) {
//     await AsyncStorage.setItem(key, JSON.stringify(value));
// }


export default FeedClient;
import axios from 'axios';

export const feedIdFromUri = (uri) => {
    if (!uri.startsWith('feed://')) {
        return null;
    }
    const list0 = uri.split('/');
    return list0[2];
}

export const getFeedId = async (feedName) => {
    const url = `/api/kachery/feed/getFeedId`;
    const d = {
        feedName
    }
    const result = await axios.post(url, d);
    if (result.data.success) {
        return result.data.feedId;
    }
    else {
        throw Error(result.data.error);
    }
}

export const getPathQuery = ({feedUri}) => {
    if (feedUri === 'default') return '';
    else return `?feed=${feedUri}`;
}

export const getNumMessages = async ({feedId, subfeedName}) => {
    const url = `/api/kachery/feed/getNumMessages`;
    const result = await axios.post(url, {feedId, subfeedName});
    if (result.data.success) {
        return result.data.numMessages;
    }
    else {
        throw Error(result.data.error);
    }
}

export const getMessages = async ({feedUri, subfeedName, position, maxNumMessages, waitMsec}) => {
    const url = `/api/kachery/feed/getMessages`;
    const result = await axios.post(url, {feedUri, subfeedName, position, maxNumMessages, waitMsec});
    if (result.data.success) {
        return result.data.messages;
    }
    else {
        throw Error(result.data.error);
    }
}

export const watchForNewMessages = async ({subfeedWatches, waitMsec}) => {
    const url = `/api/kachery/feed/watchForNewMessages`;
    const result = await axios.post(url, {subfeedWatches, waitMsec});
    if (result.data.success) {
        return result.data.messages;
    }
    else {
        throw Error(result.data.error);
    }
}

export const appendMessage = async ({feedUri, subfeedName, message}) => {
    await appendMessages({feedUri, subfeedName, messages: [message]});
}

export const appendMessages = async ({feedUri, subfeedName, messages}) => {
    const feedId = (feedUri === 'default') ? 'default' : feedIdFromUri(feedUri);
    if (!feedId) {
        throw Error(`Unable to get feedId from uri: ${feedUri}`);
    }
    const url = `/api/kachery/feed/appendMessages`;
    const result = await axios.post(url, {feedId, subfeedName, messages});
    if (result.data.success) {
        return;
    }
    else {
        throw Error(result.data.error);
    }
}

export const loadText = async (uri) => {
    const url = `/api/kachery/loadText`;
    const result = await axios.post(url, {uri});
    if (result.data.success) {
        return result.data.text;
    }
    else {
        throw Error(result.data.error);
    }
}

export const loadObject = async (uri) => {
    const url = `/api/kachery/loadObject`;
    const result = await axios.post(url, {uri});
    if (result.data.success) {
        return result.data.object;
    }
    else {
        throw Error(result.data.error);
    }
}

export const loadBytes = async (uri, {start, end}) => {
    const url = `/api/kachery/loadBytes`;
    const result = await axios.post(url, {uri, start, end});
    if (result.data.success) {
        return atob(result.data.data_b64);
    }
    else {
        throw Error(result.data.error);
    }
}
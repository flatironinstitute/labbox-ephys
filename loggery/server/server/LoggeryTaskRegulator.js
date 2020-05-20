import crypto from 'crypto';

export default class LoggeryTaskRegulator {
    constructor(config) {
        this._channels = {};

        if (!config.channels) {
            throw new Error(`Missing field in config: channels`);
        }
        if (config.channels.length === 0) {
            console.warn('No channels provided in config file');
        }
        for (let ch of config.channels) {
            this._channels[ch.name] = new Channel(ch);
        }
    }
    approveTask(taskName, streamId, numBytes, channelName, signature, req) {
        if (!this._channels[channelName]) {
            return { approved: false, reason: `Channel not found in config: ${channelName}` };
        }
        let channel = this._channels[channelName];
        if (!verifySignature(taskName, streamId, channel.password(), signature)) {
            return { approve: false, reason: 'incorrect or missing signature', delay: 1000 };
        }
        if (taskName === 'readEvents') {
            return channel.approveReadEventsTask(req);
        }
        else if (taskName === 'writeEvents') {
            return channel.approveWriteEventsTask(numBytes, req);
        }
        else {
            throw new Error(`Unexpected taskName in approveTask: ${taskName}`);
        }
    }
    finalizeTask(taskName, channelName, numBytes, approvalObject) {
        if (!this._channels[channelName]) {
            return { approved: false, reason: `Channel not found in config: ${channelName}` };
        }
        let channel = this._channels[channelName];
        if (taskName === 'readEvents') {
            return channel.finalizeReadEventsTask(approvalObject);
        }
        else if (taskName === 'writeEvents') {
            return channel.finalizeWriteEventsTask(numBytes, approvalObject);
        }
        else {
            throw new Error(`Unexpected taskName in finalizeTask: ${taskName}`);
        }
    }
}

class Channel {
    constructor(config) {
        this._password = config.password;
        this._readonly = config.readonly;
    }
    password() {
        return this._password;
    }
    approveReadEventsTask(req) {
        return { approve: true };
    }
    approveWriteEventsTask(numBytes, req) {
        if (this._readonly) {
            return { approve: false, reason: 'This is a readonly channel.' };
        }
        return { approve: true };
    }
    finalizeReadEventsTask(numBytes, approvalObject) {
    }
    finalizeWriteEventsTask(numBytes, approvalObject) {
    }
}

function getNumBytesFromRangeHeader(req, numBytes) {
    let subranges = req.range(numBytes);
    if (subranges.type != 'bytes') {
        console.warn('Range header type is not bytes. Using full size of file for quota approvals.');
        return numBytes;
    }
    let ret = 0;
    for (let sr of subranges) {
        ret += sr.end - sr.start + 1;
    }
    return ret;
}

function sha1OfObject(obj) {
    let shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(obj));
    return shasum.digest('hex');
}

function verifySignature(taskName, streamId, password, signature) {
    if (process.env.LOGGERY_TEST_SIGNATURE) {
        if ((signature === process.env.LOGGERY_TEST_SIGNATURE)) {
            console.warn('WARNING: verified using test signature from LOGGERY_TEST_SIGNATURE environment variable');
            return true;
        }
    }
    let expectedSignature = sha1OfObject({
        // keys in alphabetical order
        password: password,
        streamId: streamId,
        taskName: taskName
    });
    return ((signature === expectedSignature));
}

function sameDay(d1, d2) {
    return (
        (d1.getFullYear() === d2.getFullYear()) &&
        (d1.getMonth() === d2.getMonth()) &&
        (d1.getDate() === d2.getDate())
    );
}


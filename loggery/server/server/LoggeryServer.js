import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import fs from 'fs';
import LoggeryTaskRegulator from './LoggeryTaskRegulator.js';

export default class LoggeryServer {
    constructor(storageDir) {
        const config = readJsonFileSync(storageDir + '/loggery.json', null);
        if (!config) {
            throw Error(`Unable to read configuration file: ${storageDir}/loggery.json`);
        }
        mkdirIfNeeded(storageDir + '/streams');
        this._storageDir = storageDir;
        this._regulator = new LoggeryTaskRegulator(config);;
        this._eventStreamManager = new EventStreamManager();
        this._eventStreamManager.setDirectory(this._storageDir);

        this._app = express(); // the express app

        this._app.set('json spaces', 4); // when we respond with json, this is how it will be formatted
        this._app.use(cors());
        this._app.use(express.json());

        this._app.get('/probe', async (req, res) => {
            await waitMsec(1000);
            try {
                await this._apiProbe(req, res) 
            }
            catch(err) {
                await this._errorResponse(req, res, 500, err.message);
            }
        });
        this._app.post('/readEvents/:streamId/:position', async (req, res) => {
            const reqData = req.body
            let approvalObject = await this._approveTask("readEvents", req.params.streamId, null, reqData.channel, reqData.signature, req);
            if (!approvalObject.approve) {
                await this._errorResponse(req, res, 500, approvalObject.reason);
                return;
            }
            try {
                await this._apiReadEvents(req, res)
            }
            catch(err) {
                await this._errorResponse(req, res, 500, err.message);
            }
            finally {
                this._finalizeTask('readEvents', reqData.channel, null, approvalObject);
            }
        });
        this._app.post('/writeEvents/:streamId', async (req, res) => {
            let numBytes = Number(req.headers['content-length']);
            const reqData = req.body
            if (isNaN(numBytes))  {
                await this._errorResponse(req, res, 500, 'Missing or invalid content-length in request header');
                return;
            }
            let approvalObject = await this._approveTask("writeEvents", req.params.streamId, numBytes, reqData.channel, reqData.signature, req);
            if (!approvalObject.approve) {
                await this._errorResponse(req, res, 500, approvalObject.reason);
                return;
            }
            try {
                await this._apiWriteEvents(req, res);
                this._finalizeTask('writeEvents', reqData.channel, numBytes, approvalObject);
            }
            catch(err) {
                await this._errorResponse(req, res, 500, err.message);
                this._finalizeTask('writeEvents', reqData.channel, 0, approvalObject);
            }
        });

        this._startIterate();
    }
    async _startIterate() {
        setTimeout(async () => {
            while (true) {
                await sleepMsec(5000);
                await this._eventStreamManager.iterate();
            }
        }, 5000);
    }
    async _apiProbe(req, res) {
        res.json({ success: true });
    }
    async _apiReadEvents(req, res) {
        let params = req.params;
        const reqData = req.body
        const streamId = params.streamId;
        const position = parseInt(params.position);
        if (!validateStreamId(streamId)) {
            await this._errorResponse(req, res, 500, `Invalid stream ID`);
            return;
        }
        let result;
        try {
            result = await this._eventStreamManager.getEvents(streamId, position, {waitMsec: reqData.waitMsec});
            res.json( result );
        }
        catch(err) {
            const errstr = `Error getting events from stream ${streamId}: ${err.message}`;
            console.warn(errstr);
            await this._errorResponse(req, res, 500, errstr);
        }
    }
    async _apiWriteEvents(req, res) {
        const params = req.params;
        const reqData = req.body;
        const streamId = params.streamId;
        if (!validateStreamId(streamId)) {
            await this._errorResponse(req, res, 500, `Invalid stream ID`);
            return;
        }

        const events = reqData.events;
        try {
            await this._eventStreamManager.appendEvents(streamId, events);
            res.json({ success: true });
        }
        catch(err) {
            const errstr = `Error writing events to stream ${streamId}: ${err.message}`;
            console.warn(errstr);
            await this._errorResponse(req, res, 500, errstr);
        }
    }
    async _errorResponse(req, res, code, errstr) {
        console.info(`Responding with error: ${code} ${errstr}`);
        try {
            res.status(code).send(errstr);
        }
        catch(err) {
            console.warn(`Problem sending error: ${err.message}`);
        }
        await waitMsec(100);
        try {
            req.connection.destroy();
        }
        catch(err) {
            console.warn(`Problem destroying connection: ${err.message}`);
        }
    }
    async _approveTask(taskName, streamId, numBytes, channel, signature, req) {
        let approval = this._regulator.approveTask(taskName, streamId, numBytes, channel, signature, req);
        if (approval.defer) {
            console.info(`Deferring ${taskName} task`);
            while (approval.defer) {
                await waitMsec(500);
            }
            console.info(`Starting deferred ${taskName}`);
        }
        if (approval.delay) {
            await waitMsec(approval.delay);
        }
        return approval;
    }
    _finalizeTask(taskName, channel, numBytes, approvalObject) {
        return this._regulator.finalizeTask(taskName, channel, numBytes, approvalObject);
    }
    async listen(port) {
        await start_http_server(this._app, port);
    }
}

class EventStream {
    constructor(directory) {
        this.directory = directory;
        this.events = [];
        this.eventsPath = `${this.directory}/events.txt`;
        this._locked = false;
        this._initialized = false;
    }
    async initialize() {
        await this._lock();

        if (this._initialized) return;

        this.events = await readEventsFile(this.eventsPath);

        this._initialized = true;

        await this._unlock();
    }
    async appendEvents(events) {
        for (let e of events) {
            this.appendEvent(e);
        }
    }
    async appendEvent(event) {
        await this._lock();

        appendToEventsFile(this.eventsPath, event);
        this.events.push(event);

        await this._unlock();
    }
    async getEvents(position, opts) {
        const timer = new Date();
        while (true) {
            if (position < this.events.length) {
                return {
                    events: [...this.events.slice(position)],
                    newPosition: this.events.length,
                    success: true
                }
            }
            const elapsed = (new Date() - timer);
            if ((opts.waitMsec) && (elapsed < opts.waitMsec)) {
                await sleepMsec(10);
            }
            else {
                return {
                    events: [],
                    newPosition: position,
                    success: true
                }
            }
        }
    }
    async iterate() {
        /////////////////////
        await this._lock();
        /////////////////////

        // do any maintenance (e.g., indexing) here

        /////////////////////
        await this._unlock();
        /////////////////////
    }
    async _lock() {
        while (this._locked) {
            await sleepMsec(10);
        }
        this._locked = true;
    }
    async _unlock() {
        this._locked = false;
    }
}

class EventStreamManager {
    constructor() {
        this.directory = null;
        this.streams = {};
    }
    setDirectory(directory) {
        this.directory = directory;
    }
    async _loadStream(streamId, createIfNeeded) {
        if (!(streamId in this.streams)) {
            const dirpath = `${this.directory}/streams/${streamId[0]}${streamId[1]}/${streamId[2]}${streamId[3]}/${streamId[4]}${streamId[5]}/${streamId}`;
            // See: https://stackoverflow.com/questions/13696148/node-js-create-folder-or-use-existing/24311711
            if (!fs.existsSync(dirpath)) {
                if (createIfNeeded) {
                    await fs.promises.mkdir(dirpath, { recursive: true });
                }
            }
            if (fs.existsSync(dirpath)) {
                this.streams[streamId] = new EventStream(dirpath);
                await this.streams[streamId].initialize();
            }   
        }
    }
    async appendEvents(streamId, events) {
        await this._loadStream(streamId, true);
        const S = this.streams[streamId];
        if (!S) return;
        await S.appendEvents(events);
    }
    async getEvents(streamId, position, opts) {
        await this._loadStream(streamId, false);
        const S = this.streams[streamId];
        if (!S) return {
            success: true,
            events: [],
            newPosition: position
        };
        return await S.getEvents(position, opts);
    }
    async iterate() {
        for (let streamId in this.streams) {
            let stream = this.streams[streamId];
            await stream.iterate();
        }
    }
}

function waitMsec(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function start_http_server(app, listen_port) {
    app.port = listen_port;
    if (process.env.SSL != null ? process.env.SSL : listen_port % 1000 == 443) {
        // The port number ends with 443, so we are using https
        app.USING_HTTPS = true;
        app.protocol = 'https';
        // Look for the credentials inside the encryption directory
        // You can generate these for free using the tools of letsencrypt.org
        const options = {
            key: fs.readFileSync(__dirname + '/encryption/privkey.pem'),
            cert: fs.readFileSync(__dirname + '/encryption/fullchain.pem'),
            ca: fs.readFileSync(__dirname + '/encryption/chain.pem')
        };

        // Create the https server
        app.server = https.createServer(options, app);
    } else {
        app.protocol = 'http';
        // Create the http server and start listening
        app.server = http.createServer(app);
    }
    await app.server.listen(listen_port);
    console.info(`Server is running ${app.protocol} on port ${app.port}`);
}

async function writeJsonFile(path, x) {
    await fs.promises.writeFile(path, JSON.stringify(x), {encoding: 'utf8'});
}

async function readEventsFile(path) {
    let txt;
    try {
        txt = await fs.promises.readFile(path, {encoding: 'utf8'});
    }
    catch(err) {
        return [];
    }
    if (typeof(txt) !== 'string') {
        console.error(txt);
        throw Error('Unexpected: txt is not a string.');
    }
    let events = [];
    const lines = txt.split('\n');
    for (let line of lines) {
        if (line) {
            try {
                events.push(JSON.parse(line));
            }
            catch(err) {
                console.error(line);
                console.warn(`Problem parsing JSON from file: ${path}`);
                return [];
            }
        }
    }
    return events;
}

async function appendToEventsFile(path, event) {
    await fs.promises.appendFile(path, JSON.stringify(event) + '\n', {encoding: 'utf8'});
}

// async function readJsonFile(path, defaultVal) {
//     let txt;
//     try {
//         txt = await fs.promises.readFile(path, {encoding: 'utf8'});
//     }
//     catch(err) {
//         return defaultVal;
//     }
//     try {
//         return JSON.parse(txt);
//     }
//     catch(err) {
//         console.warn(`Problem parsing JSON from file: ${path}`);
//         return defaultVal;
//     }
// }
function readJsonFileSync(path, defaultVal) {
    let txt;
    try {
        txt = fs.readFileSync(path);
    }
    catch(err) {
        return defaultVal;
    }
    try {
        return JSON.parse(txt);
    }
    catch(err) {
        console.warn(`Problem parsing JSON from file: ${path}`);
        return defaultVal;
    }
}
function mkdirIfNeeded(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

function sleepMsec(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const isAlphaNumeric = ch => {
	return ch.match(/^[a-z0-9]+$/i) !== null;
}

function validateStreamId(streamId) {
    if (streamId.length < 20) return false;
    if (streamId.length > 40) return false;
    if (!isAlphaNumeric) return false;
    return true;   
}
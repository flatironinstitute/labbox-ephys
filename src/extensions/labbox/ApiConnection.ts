class ApiConnection {
    _ws: WebSocket | null = null
    _isConnected: boolean = false
    _onMessageCallbacks: ((m: any) => void)[] = []
    _onConnectCallbacks: (() => void)[] = []
    _onDisconnectCallbacks: (() => void)[] = []
    _isDisconnected = false // once disconnected, cannot reconnect - need to create a new instance
    _queuedMessages: any[] = []

    constructor() {
        this._start();
        this._connect()
    }
    _connect() {
        const url = `ws://${window.location.hostname}:15308`;
        this._ws = new WebSocket(url);
        console.log(this._ws);
        this._ws.addEventListener('open', () => {
            this._isConnected = true;
            this._isDisconnected = false;
            const qm = this._queuedMessages;
            this._queuedMessages = [];
            for (let m of qm) {
                this.sendMessage(m);
            }
            this._onConnectCallbacks.forEach(cb => cb());
        });
        this._ws.addEventListener('message', evt => {
            const x = JSON.parse(evt.data);
            if (!Array.isArray(x)) {
                console.warn(x)
                console.warn('Error getting message, expected a list')
                return
            }
            console.info('INCOMING MESSAGES', x);
            for (const m of x) {
                this._onMessageCallbacks.forEach(cb => cb(m))
            }
        });
        this._ws.addEventListener('close', () => {
            console.warn('Websocket disconnected.');
            this._isConnected = false;
            this._isDisconnected = true;
            this._onDisconnectCallbacks.forEach(cb => cb())
        })
    }
    reconnect() {
        if (!this._isDisconnected) {
            throw Error('Error: Cannot reconnect if not disconnected')
        }
        this._connect()
    }
    onMessage(cb: (m: any) => void) {
        this._onMessageCallbacks.push(cb);
    }
    onConnect(cb: () => void) {
        this._onConnectCallbacks.push(cb);
        if (this._isConnected) {
            cb();
        }
    }
    onDisconnect(cb: () => void) {
        this._onDisconnectCallbacks.push(cb)
        if (this._isDisconnected) {
            cb()
        }
    }
    isDisconnected() {
        return this._isDisconnected;
    }
    isConnected() {
        return this._isConnected
    }
    sendMessage(msg: any) {
        if ((!this._isConnected) && (!this._isDisconnected)) {
            this._queuedMessages.push(msg);
            return;
        }
        if (!this._ws) throw Error('Unexpected: _ws is null')
        console.info('OUTGOING MESSAGE', msg);
        this._ws.send(JSON.stringify(msg));
    }
    async _start() {
        while (true) {
            await sleepMsec(17000);
            if (!this._isDisconnected) this.sendMessage({ type: 'keepAlive' });
        }
    }
}

const sleepMsec = (m: number) => new Promise(r => setTimeout(r, m));

export default ApiConnection
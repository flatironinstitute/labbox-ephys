import { SET_WEBSOCKET_STATUS } from "./actions"
import { sleepMsec } from "./extensions/common/misc"
import { RootAction } from "./reducers"

interface StoreInterface {
    dispatch: (a: RootAction) => void
}

class ApiConnection {
    _ws: WebSocket
    _connected: boolean = false
    _onMessageCallbacks: ((m: any) => void)[] = []
    _onConnectCallbacks: (() => void)[] = []
    _onDisconnectCallbacks: (() => void)[] = []
    _isDisconnected = false // once disconnected, cannot reconnect - need to create a new instance
    _queuedMessages: any[] = []

    constructor(private store: StoreInterface) {
        const url = `ws://${window.location.hostname}:15308`;

        this._ws = new WebSocket(url);
        console.log(this._ws);
        this._ws.addEventListener('open', () => {
            this._connected = true;
            const qm = this._queuedMessages;
            this._queuedMessages = [];
            for (let m of qm) {
                this.sendMessage(m);
            }
            this._onConnectCallbacks.forEach(cb => cb());
            this.store.dispatch({ type: SET_WEBSOCKET_STATUS, websocketStatus: 'connected' });
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
            this._connected = false;
            this._isDisconnected = true;
            this._onDisconnectCallbacks.forEach(cb => cb())
            this.store.dispatch({ type: SET_WEBSOCKET_STATUS, websocketStatus: 'disconnected' });
        })

        this._start();
    }
    onMessage(cb: (m: any) => void) {
        this._onMessageCallbacks.push(cb);
    }
    onConnect(cb: () => void) {
        this._onConnectCallbacks.push(cb);
        if (this._connected) {
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
    sendMessage(msg: any) {
        if (!this._connected) {
            this._queuedMessages.push(msg);
            return;
        }
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

export default ApiConnection
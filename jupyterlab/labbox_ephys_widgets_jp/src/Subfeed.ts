import { WidgetModel } from '@jupyter-widgets/base';
import '../css/styles.css';
import '../css/widget.css';

class Subfeed {
    _messages: any[] = []
    _onMessageCallbacks: ((msg: any) => void)[] = []
    constructor(private model: WidgetModel, private uri: string) {
        const { feedId, subfeedHash } = parseSubfeedUri(uri)
        const watchName = randomAlphaId()
        model.send({ type: 'addSubfeedWatch', watchName, feedId, subfeedHash }, {})
        model.on('msg:custom', (msg: any) => {
            if (msg.type === 'subfeedMessage') {
                if (msg.watchName === watchName) {
                    this._messages.push(msg.message)
                    this._onMessageCallbacks.forEach(cb => cb(msg.message))
                }
            }
        })
    }
    appendMessage(message: any) {
        const { feedId, subfeedHash } = parseSubfeedUri(this.uri)
        this.model.send({ type: 'appendSubfeedMessage', feedId, subfeedHash, message }, {})
    }
    allMessages() {
        return [...this._messages]
    }
    onMessage(cb: (msg: any) => void) {
        this._onMessageCallbacks.push(cb)
    }
}

const parseSubfeedUri = (uri: string): { feedId: string, subfeedHash: string } => {
    // feed://<feed-id>/~<subfeed-hash>
    const vals = uri.split('/')
    if (vals[0] !== 'feed:') throw Error(`Problem with subfeed uri: ${uri}`)
    if (vals[1] !== '') throw Error(`Problem with subfeed uri: ${uri}`)
    const feedId = vals[2]
    if (!vals[3].startsWith('~')) throw Error(`Problem with subfeed uri: ${uri}`)
    const subfeedHash = vals[3].slice(1)
    return { feedId, subfeedHash }
}

function randomAlphaId() {
    const num_chars = 10;
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default Subfeed
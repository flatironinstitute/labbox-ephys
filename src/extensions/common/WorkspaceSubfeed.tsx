interface ApiConnectionInterface {
    sendMessage: (msg: any) => void
    onMessage: (callback: (msg: any) => void) => void
}

class WorkspaceSubfeed {
    _apiConnection: ApiConnectionInterface | null = null
    _messages: any[] = []
    _queuedMessages: any[] = []
    _onMessageCallbacks: ((msg: any) => void)[] = []
    initialize(apiConnection: ApiConnectionInterface) {
        this._apiConnection = apiConnection
        apiConnection.sendMessage({
            type: 'addWorkspaceSubfeedWatch',
            watchName: 'workspace',
            position: this._messages.length
        })
        apiConnection.onMessage((msg: any) => {
            if (msg.type === 'subfeedMessage') {
                if (msg.watchName === 'workspace') {

                    this._messages.push(msg.message)
                    this._onMessageCallbacks.forEach(cb => cb(msg.message))
                }
            }
        })
        const qm = this._queuedMessages
        this._queuedMessages = []
        for (const m of qm) {
            this.appendMessage(m)
        }
    }
    appendMessage(message: any) {
        if (!this._apiConnection) {
            this._queuedMessages.push(message)
            return
        }
        this._apiConnection.sendMessage({
            type: 'appendWorkspaceSubfeedMessage',
            message
        })
    }
    allMessages() {
        return [...this._messages]
    }
    onMessage(cb: (msg: any) => void) {
        this._onMessageCallbacks.push(cb)
    }
}

export default WorkspaceSubfeed
const createCalculationPool = ({maxSimultaneous, method='queue'}) => {
    return new CalculationPool({maxSimultaneous, method})
}

class CalculationPool {
    constructor({maxSimultaneous, method='queue'}) {
        this._maxSimultaneous = maxSimultaneous;
        this._method = method; // stack or queue
        this._activeSlots = {};
        this._numActiveSlots = 0;
        this._lastSlotId = -1;
        this._pendingRequestCallbacks = [];
    }
    async requestSlot() {
        if (this._numActiveSlots < this._maxSimultaneous) {
            const slot = this._createNewSlot();
            return slot;
        }
        return new Promise((resolve, reject) => {
            this._pendingRequestCallbacks.push((slot) => {
                resolve(slot);
            });
        });
    }
    _createNewSlot() {
        const slotId = this._lastSlotId + 1;
        this._lastSlotId = slotId;
        this._numActiveSlots ++;
        this._activeSlots[slotId] = {
            slotId,
            complete: () => {
                this._numActiveSlots --;
                delete this._activeSlots[slotId];
                this._update();
            }
        }
        return this._activeSlots[slotId];
    }
    _update() {
        while ((this._pendingRequestCallbacks.length > 0) && (this._numActiveSlots < this._maxSimultaneous)) {
            let cb;
            if (this._method === 'queue') {
                cb = this._pendingRequestCallbacks.shift();
            }
            else if (this._method === 'stack') {
                cb = this._pendingRequestCallbacks.pop();
            }
            else {
                throw Error(`Unexpected method in calculation pool: ${this._method}`);
            }
            const slot = this._createNewSlot();
            cb(slot);            
        }
    }
}

export default createCalculationPool
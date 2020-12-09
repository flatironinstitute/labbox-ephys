const createCalculationPool = ({maxSimultaneous, method}: {maxSimultaneous: number, method?: 'stack' | 'queue'}) => {
    return new CalculationPool({maxSimultaneous, method})
}

interface Slot {
    slotId: number
    complete: () => void
}

class CalculationPool {
    _maxSimultaneous: number
    _method: 'stack' | 'queue'
    _activeSlots: {[key: string]: Slot}
    _numActiveSlots: number
    _lastSlotId: number
    _pendingRequestCallbacks: ((slot: Slot) => void)[]
    constructor({maxSimultaneous, method}: {maxSimultaneous: number, method?: 'stack' | 'queue'}) {
        this._maxSimultaneous = maxSimultaneous;
        this._method = method || 'queue'; // stack or queue
        this._activeSlots = {};
        this._numActiveSlots = 0;
        this._lastSlotId = -1;
        this._pendingRequestCallbacks = [];
    }
    async requestSlot(): Promise<Slot> {
        if (this._numActiveSlots < this._maxSimultaneous) {
            const slot = this._createNewSlot();
            return slot;
        }
        return new Promise((resolve, reject) => {
            this._pendingRequestCallbacks.push((slot: Slot) => {
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
            let cb: ((slot: Slot) => void) | undefined;
            if (this._method === 'queue') {
                cb = this._pendingRequestCallbacks.shift();
            }
            else if (this._method === 'stack') {
                cb = this._pendingRequestCallbacks.pop();
            }
            else {
                throw Error(`Unexpected method in calculation pool: ${this._method}`);
            }
            if (!cb) throw Error('unexpected')
            const slot = this._createNewSlot();
            cb(slot);            
        }
    }
}

export default createCalculationPool
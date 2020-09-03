class CalculationPool {
    constructor({maxSimultaneous}) {
        this._maxSimultaneous =  maxSimultaneous;
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
            const cb = this._pendingRequestCallbacks.shift();
            const slot = this._createNewSlot();
            cb(slot);            
        }
    }
}

export default CalculationPool
interface MdaInterface {
  value: (i1: number, i2: number) => number
}

class TimeseriesModelNew {
  _dataSegments = new Map<string, MdaInterface>()
  _requestDataSegmentHandlers: ((ds_factor: number, segment_num: number) => void)[] = []
  _dataSegmentSetHandlers: ((ds_factor: number, t1: number, t2: number) => void)[] = []
  _dataSegmentsRequested = new Map<string, boolean>()
  constructor(private args: { samplerate: number, num_channels: number, num_timepoints: number, segment_size: number }) {
  }
  clear() {
    this._dataSegments.clear()
    this._dataSegmentsRequested.clear()
  }
  setDataSegment(ds_factor: number, segment_num: number, X: MdaInterface) {
    const code = `${ds_factor}:${segment_num}`
    this._dataSegments.set(code, X)
    this._dataSegmentSetHandlers.forEach(handler => {
      handler(ds_factor, this.args.segment_size * ds_factor * segment_num, this.args.segment_size * ds_factor * (segment_num + 1))
    })
  }
  onRequestDataSegment(handler: (ds_factor: number, segment_num: number) => void) {
    this._requestDataSegmentHandlers.push(handler)
  }
  onDataSegmentSet(handler: (ds_factor: number, t1: number, t2: number) => void) {
    this._dataSegmentSetHandlers.push(handler)
  }
  getChannelData(ch: number, t1: number, t2: number, ds_factor: number): number[] {
    const segment_size = this.args.segment_size
    const s1 = Math.floor(t1 / segment_size);
    const s2 = Math.floor(t2 / segment_size);
    this.requestChannelData(ch, t1, t2, ds_factor)

    const ret = [];
    if (ds_factor === 1) {
      for (let t = t1; t < t2; t++) {
        ret.push(NaN);
      }
    }
    else {
      for (let t = t1; t < t2; t++) {
        ret.push(NaN);
        ret.push(NaN);
      }
    }

    if (s1 === s2) {
      const X = this._dataSegments.get(ds_factor + ':' + s1) || null
      const t1_rel = (t1 - s1 * segment_size);
      if (X) {
        if (ds_factor === 1) {
          for (let ii = 0; ii < t2 - t1; ii++) {
            ret[ii] = X.value(ch, t1_rel + ii);
          }
        }
        else {
          for (let ii = 0; ii < t2 - t1; ii++) {
            ret[ii * 2] = X.value(ch, (t1_rel + ii) * 2);
            ret[ii * 2 + 1] = X.value(ch, (t1_rel + ii) * 2 + 1);
          }
        }
      }
    }
    else {
      let ii_0 = 0;
      for (let ss = s1; ss <= s2; ss++) {
        const X = this._dataSegments.get(ds_factor + ':' + ss) || null
        if (ss === s1) {
          const t1_rel = (t1 - ss * segment_size);
          if (X) {
            if (ds_factor === 1) {
              for (let ii = 0; ii < segment_size - t1_rel; ii++) {
                ret[ii] = X.value(ch, t1_rel + ii);
              }
            }
            else {
              for (let ii = 0; ii < segment_size - t1_rel; ii++) {
                ret[ii * 2] = X.value(ch, (t1_rel + ii) * 2);
                ret[ii * 2 + 1] = X.value(ch, (t1_rel + ii) * 2 + 1);
              }
            }
          }
          ii_0 = segment_size - t1_rel;
        }
        else if (ss === s2) {
          const t2_rel = (t2 - ss * segment_size);
          if (X) {
            if (ds_factor === 1) {
              for (let ii = ii_0; ii < ii_0 + t2_rel; ii++) {
                ret[ii] = X.value(ch, ii - ii_0);
              }
            }
            else {
              for (let ii = ii_0; ii < ii_0 + t2_rel; ii++) {
                ret[ii * 2] = X.value(ch, (ii - ii_0) * 2);
                ret[ii * 2 + 1] = X.value(ch, (ii - ii_0) * 2 + 1);
              }
            }
          }
          ii_0 = ii_0 + t2_rel;
        }
        else {
          if (X) {
            if (ds_factor === 1) {
              for (let ii = ii_0; ii < ii_0 + segment_size; ii++) {
                ret[ii] = X.value(ch, ii - ii_0);
              }
            }
            else {
              for (let ii = ii_0; ii < ii_0 + segment_size; ii++) {
                ret[ii * 2] = X.value(ch, (ii - ii_0) * 2);
                ret[ii * 2 + 1] = X.value(ch, (ii - ii_0) * 2 + 1);
              }
            }
          }
          ii_0 = ii_0 + segment_size;
        }
      }
    }
    return ret;
  }
  requestChannelData(ch: number, t1: number, t2: number, ds_factor: number) {
    const segment_size = this.args.segment_size
    const num_timepoints = this.args.num_timepoints
    let s1 = Math.floor(t1 / segment_size);
    let s2 = Math.floor(t2 / segment_size);
    //for (let ss=s1; ss<=s2; ss++) {
    for (let ss = s1 - 1; ss <= s2 + 1; ss++) {
      if ((ss >= 0) && (ss < Math.ceil(num_timepoints / segment_size))) {
        if (!(this._dataSegments.has(ds_factor + ':' + ss))) {
          if (!(this._dataSegmentsRequested.has(ds_factor + ':' + ss))) {
            this._requestDataSegmentHandlers.forEach(handler => {
              handler(ds_factor, ss)
            })
            this._dataSegmentsRequested.set(ds_factor + ':' + ss, true)
          }
        }
      }
    }
  }
  numChannels() {
    return this.args.num_channels
  }
  numTimepoints() {
    return this.args.num_timepoints
  }
  getSampleRate() {
    return this.args.samplerate
  }
}

export default TimeseriesModelNew
import { useContext, useMemo } from "react"
import { createCalculationPool, HitherContext, HitherInterface } from "../../common/hither"
import useFetchCache from "../../common/useFetchCache"
import { RecordingInfo } from "../../extensionInterface"

// it may be important to limit this to 1 at a time when using a filter
const timeseriesCalculationPool = createCalculationPool({maxSimultaneous: 1, method: 'stack'})

export type TimeseriesData = {
  getChannelData: (ch: number, t1: number, t2: number, ds_factor: number) => number[]
  requestChannelData: (ch: number, t1: number, t2: number, ds_factor: number) => void
  numChannels: () => number
  numTimepoints: () => number
  getSampleRate: () => number
}

const getTimeseriesDataSegment = async (args: {hither: HitherInterface, recordingObject: any, ds_factor: number, segment_num: number, segment_size: number}): Promise<number[][]> => {
  const { hither, recordingObject, ds_factor, segment_num, segment_size } = args
  const result = await hither.createHitherJob(
      'createjob_get_timeseries_segment',
      {
          recording_object: recordingObject,
          ds_factor,
          segment_num,
          segment_size
      },
      {
          useClientCache: true,
          calculationPool: timeseriesCalculationPool
      }
  ).wait() as {
      traces: number[][]
  }
  // let X = new Mda()
  // X.setFromBase64(result.data_b64);
  // return X
  return result.traces
}

type TimeseriesDataSegmentQuery = {
  type: 'dataSegment',
  ds_factor: number,
  segment_num: number,
  segment_size: number
}

type TimeseriesDataQuery = TimeseriesDataSegmentQuery

const useTimeseriesData = (recordingObject: any, recordingInfo: RecordingInfo): TimeseriesData | null => {
  const hither = useContext(HitherContext)
  const fetch = useMemo(() => (async (query: TimeseriesDataQuery) => {
    switch(query.type) {
      case 'dataSegment': {
        return await getTimeseriesDataSegment({hither, recordingObject, ds_factor: query.ds_factor, segment_num: query.segment_num, segment_size: query.segment_size})
      }
    }
  }), [hither, recordingObject])
  const data = useFetchCache<TimeseriesDataQuery>(fetch)

  const segment_size_times_num_channels = 100000
  const num_channels = recordingInfo.channel_ids.length
  const segment_size = Math.ceil(segment_size_times_num_channels / num_channels)

  const getChannelData = useMemo(() => ((ch: number, t1: number, t2: number, ds_factor: number) => {
    const i1 = Math.floor(Math.max(0, t1) / segment_size)
    const i2 = Math.ceil((Math.min(t2, recordingInfo.num_frames) -1) / segment_size)
    const segments = []
    for (let i = i1; i <= i2; i++) {
      if ((i === i1) && (i === i2)) {
        segments.push({
          segment_num: i,
          t1: i * segment_size,
          t2: (i + 1) * segment_size,
          src1: t1 - (i * segment_size),
          src2: t2 - (i * segment_size),
          dst1: 0,
          dst2: t2 - t1
        })
      }
      else if (i === i1) {
        segments.push({
          segment_num: i,
          t1: i * segment_size,
          t2: (i + 1) * segment_size,
          src1: t1 - (i * segment_size),
          src2: segment_size,
          dst1: 0,
          dst2: segment_size + (i * segment_size) - t1
        })
      }
      else if (i === i2) {
        segments.push({
          segment_num: i,
          t1: i * segment_size,
          t2: (i + 1) * segment_size,
          src1: 0,
          src2: t2 - (i * segment_size),
          dst1: i * segment_size - t1,
          dst2: t2 - t1
        })
      }
      else {
        segments.push({
          segment_num: i,
          t1: i * segment_size,
          t2: (i + 1) * segment_size,
          src1: 0,
          src2: segment_size,
          dst1: i * segment_size - t1,
          dst2: (i + 1) * segment_size - t1
        })
      }
    }

    const ret: number[] = [];
    if (ds_factor === 1) {
      for (let t = t1; t < t2; t++) {
        ret.push(NaN)
      }
      for (let segment of segments) {
        const x = data.get({type: 'dataSegment', ds_factor, segment_num: segment.segment_num, segment_size}) as number[][] | undefined
        if (x) {
          for (let i = 0; i < segment.src2 - segment.src1; i++) {
            ret[segment.dst1 + i] = x[ch][segment.src1 + i]
          }
        }
      }
    }
    else {
      for (let t = t1; t < t2; t++) {
        ret.push(NaN)
        ret.push(NaN)
      }
      for (let segment of segments) {
        const x = data.get({type: 'dataSegment', ds_factor, segment_num: segment.segment_num, segment_size}) as number[][] | undefined
        if (x) {
          for (let i = 0; i < segment.src2 - segment.src1; i++) {
            ret[(segment.dst1 + i) * 2] = x[ch][(segment.src1 + i) * 2]
            ret[(segment.dst1 + i) * 2 + 1] = x[ch][(segment.src1 + i) * 2 + 1]
          }
        }
      }
    }

    return ret
  }), [data, segment_size])

  return useMemo(() => ({
    getChannelData,
    requestChannelData: getChannelData,
    numChannels: () => (recordingInfo.channel_ids.length),
    numTimepoints: () => (recordingInfo.num_frames),
    getSampleRate: () => (recordingInfo.sampling_frequency)
  }), [getChannelData, recordingInfo])
}

export default useTimeseriesData
import React, { useEffect, useState } from 'react';
import createCalculationPool from '../../common/createCalculationPool';
import { HitherContext, RecordingInfo } from '../../extensionInterface';
import Splitter from '../TimeWidgetNew/Splitter';
import ElectrodeGeometryView from './ElectrodeGeometryView';
import Mda from './Mda';
import TimeseriesModelNew from './TimeseriesModelNew';
import TimeseriesWidgetNew from './TimeseriesWidgetNew';

const timeseriesCalculationPool = createCalculationPool({maxSimultaneous: 4, method: 'stack'})

interface RecordingObject {

}

interface Props {
    recordingObject: RecordingObject
    recordingInfo: RecordingInfo
    width: number
    height: number
    hither: HitherContext
    opts: {
        channelSelectPanel?: boolean
    }
}

interface TimeseriesInfo {
    samplerate: number
    segment_size: number
    num_channels: number
    channel_ids: number[]
    channel_locations: (number[])[]
    num_timepoints: number
    y_offsets: number[]
    y_scale_factor: number
    initial_y_scale_factor: number
}

type StatusString = 'waiting' | 'calculating' | 'error' | 'finished'

const TimeseriesViewNew = (props: Props) => {
    const opts = props.opts
    const [status, setStatus] = useState<StatusString>('waiting')
    const [statusMessage, setStatusMessage] = useState('')
    const [timeseriesInfo, setTimeseriesInfo] = useState<TimeseriesInfo | null>(null)
    const [timeseriesModel, setTimeseriesModel] = useState<TimeseriesModelNew | null>(null)
    const [widgetKey, setWidgetKey] = useState<number>(0)
    const [selectedElectrodeIds, setSelectedElectrodeIds] = useState<number[]>([])
    const hither = props.hither

    const effect = async () => {
        if (status === 'waiting') {
            setStatus('calculating')
            setStatusMessage('Calculating timeseries info');
            let info: TimeseriesInfo
            try {
                info = await calculateTimeseriesInfo(props.recordingObject, hither)
            }
            catch(err) {
                setStatusMessage(err.message)
                setStatus('error')
                return
            }
            setTimeseriesInfo(info)
            setStatusMessage('Setting timeseries model')

            const model = new TimeseriesModelNew({
                samplerate: info.samplerate,
                num_channels: info.num_channels,
                num_timepoints: info.num_timepoints,
                segment_size: info.segment_size
            });
            model.onRequestDataSegment((ds_factor: number, segment_num: number) => {
                ;(async () => {
                    let result: {
                        data_b64: string
                    }
                    const slot = await timeseriesCalculationPool.requestSlot();
                    try {
                        result = await hither.createHitherJob(
                            'createjob_get_timeseries_segment',
                            {
                                recording_object: props.recordingObject,
                                ds_factor: ds_factor,
                                segment_num: segment_num,
                                segment_size: info.segment_size
                            },
                            {
                                useClientCache: true
                            }
                        ).wait() as {data_b64: string}
                    }
                    catch(err) {
                        console.error(`Error getting timeseries segment: ds=${ds_factor} num=${segment_num}`);
                        return;
                    }
                    finally {
                        slot.complete();
                    }
                    let X = new Mda()
                    X.setFromBase64(result.data_b64);
                    model.setDataSegment(ds_factor, segment_num, X);
                })()
            });
            
            setTimeseriesModel(model);
            setStatus('finished');

            setWidgetKey(Math.random())
            setStatusMessage('finished')
            setStatus('finished')
        }
    }
    useEffect(() => { effect(); });

    if ((status === 'finished') && (timeseriesInfo) && (timeseriesModel)) {
        if (!timeseriesModel) throw Error('Unexpected timeseriesModel is null')
        if (!timeseriesInfo) throw Error('Unexpected timeseriesInfo is null')
        return (
            <div>
                <Splitter
                    width={props.width}
                    height={props.height}
                    initialPosition={400}
                >
                    {
                        opts.channelSelectPanel && (
                            <ElectrodeGeometryView
                                recordingInfo={props.recordingInfo}
                                width={0} // filled in above
                                height={0} // filled in above
                                selectedElectrodeIds={selectedElectrodeIds}
                                onSelectedElectrodeIdsChanged={setSelectedElectrodeIds}
                            />
                        )
                    }
                    {
                        ((!opts.channelSelectPanel) || ((selectedElectrodeIds) && (selectedElectrodeIds.length > 0))) ? (
                            <TimeseriesWidgetNew
                                key={widgetKey}
                                timeseriesModel={timeseriesModel}
                                channel_ids={timeseriesInfo.channel_ids}
                                channel_locations={timeseriesInfo.channel_locations}
                                num_timepoints={timeseriesInfo.num_timepoints}
                                y_offsets={timeseriesInfo.y_offsets}
                                y_scale_factor={timeseriesInfo.y_scale_factor * (timeseriesInfo.initial_y_scale_factor || 1)}
                                width={props.width} // filled in above
                                height={props.height} // filled in above
                                visibleChannelIds={opts.channelSelectPanel ? selectedElectrodeIds : null}
                            />
                        ) : (
                            <div>Select one or more electrodes</div>
                        )
                    }
                </Splitter>
            </div>
        )
    }
    else {
        return (
            <div>{statusMessage}</div>
        )
    }
}

const calculateTimeseriesInfo = async (recordingObject: RecordingObject, hither: HitherContext): Promise<TimeseriesInfo> => {
    let info: TimeseriesInfo
    try {
        info = await hither.createHitherJob(
            'createjob_calculate_timeseries_info',
            { recording_object: recordingObject },
            {
                useClientCache: true
            }
        ).wait() as TimeseriesInfo
    }
    catch (err) {
        console.error(err);
        throw Error('Problem calculating timeseries info.')
    }
    if (!info) {
        throw Error('Unexpected problem calculating timeseries info: info is null.')
    }
    return info
}

export default TimeseriesViewNew
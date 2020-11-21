import React, { useEffect, useState } from 'react';
import { createHitherJob } from '../../hither';
import CalculationPool from '../../pluginComponents/common/CalculationPool';
import Mda from '../TimeseriesView/Mda';
import TimeseriesModel from "../TimeseriesView/TimeseriesModel";
import TimeseriesWidgetNew from './TimeseriesWidgetNew';

const timeseriesCalculationPool = new CalculationPool({maxSimultaneous: 4, method: 'stack'})

interface RecordingObject {

}

interface Props {
    recordingObject: RecordingObject
    width: number
    height: number
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

    const [status, setStatus] = useState<StatusString>('waiting')
    const [statusMessage, setStatusMessage] = useState('')
    const [timeseriesInfo, setTimeseriesInfo] = useState<TimeseriesInfo | null>(null)
    const [timeseriesModel, setTimeseriesModel] = useState<TimeseriesModel | null>(null)
    const [widgetKey, setWidgetKey] = useState<number>(0)

    const effect = async () => {
        if (status === 'waiting') {
            setStatus('calculating')
            setStatusMessage('Calculating timeseries info');
            let info: TimeseriesInfo
            try {
                info = await calculateTimeseriesInfo(props.recordingObject)
            }
            catch(err) {
                setStatusMessage(err.message)
                setStatus('error')
                return
            }
            setTimeseriesInfo(info)
            setStatusMessage('Setting timeseries model')

            const model = new TimeseriesModel({
                samplerate: info.samplerate,
                num_channels: info.num_channels,
                num_timepoints: info.num_timepoints,
                segment_size: info.segment_size
            });
            
            setTimeseriesModel(model);
            setStatus('finished');

            setWidgetKey(Math.random())
            setStatusMessage('finished')
            setStatus('finished')
        }
    }
    useEffect(() => { effect(); });

    const handleRequestDataSegment = async (ds_factor: number, segment_num: number) => {
        if (!timeseriesInfo) return
        if (!timeseriesModel) return
        let result: {
            data_b64: string
        }
        const slot = await timeseriesCalculationPool.requestSlot();
        try {
            const resultJob = await createHitherJob(
                'get_timeseries_segment',
                {
                    recording_object: props.recordingObject,
                    ds_factor: ds_factor,
                    segment_num: segment_num,
                    segment_size: timeseriesInfo.segment_size
                },
                {
                    hither_config: {
                    },
                    job_handler_name: 'timeseries',
                    useClientCache: true,
                    auto_substitute_file_objects: false
                }
            );
            result = await resultJob.wait();
        }
        catch(err) {
            console.error('Error getting timeseries segment', ds_factor, segment_num);
            return;
        }
        finally {
            slot.complete();
        }
        let X = new Mda();
        X.setFromBase64(result.data_b64);
        timeseriesModel.setDataSegment(ds_factor, segment_num, X);
    }

    if ((status === 'finished') && (timeseriesInfo) && (timeseriesModel)) {
        // todo: important, when to do this!
        timeseriesModel.onRequestDataSegment((ds_factor: number, segment_num: number) => {
            handleRequestDataSegment(ds_factor, segment_num)
        });
        if (!timeseriesModel) throw Error('Unexpected timeseriesModel is null')
        if (!timeseriesInfo) throw Error('Unexpected timeseriesInfo is null')
        return (
            <div>
                <TimeseriesWidgetNew
                    key={widgetKey}
                    timeseriesModel={timeseriesModel}
                    num_channels={timeseriesInfo.num_channels}
                    channel_ids={timeseriesInfo.channel_ids}
                    channel_locations={timeseriesInfo.channel_locations}
                    num_timepoints={timeseriesInfo.num_timepoints}
                    y_offsets={timeseriesInfo.y_offsets}
                    y_scale_factor={timeseriesInfo.y_scale_factor * (timeseriesInfo.initial_y_scale_factor || 1)}
                    width={props.width}
                    height={props.height}
                    leftPanels={[]}
                />
            </div>
        )
    }
    else {
        return (
            <div>{statusMessage}</div>
        )
    }
}

const calculateTimeseriesInfo = async (recordingObject: RecordingObject): Promise<TimeseriesInfo> => {
    let info: TimeseriesInfo
    try {
        const infoJob = await createHitherJob(
            'calculate_timeseries_info',
            { recording_object: recordingObject },
            {
                hither_config: {
                    use_job_cache: true
                },
                job_handler_name: 'timeseries',
                useClientCache: true,
                auto_substitute_file_objects: false
            }
        );
        info = await infoJob.wait();
    }
    catch (err) {
        console.error(err);
        throw Error('Problem calculating timeseries info.')
    }
    if (!info) {
        throw Error('Unepected problem calculating timeseries info: info is null.')
    }
    return info
}

export default TimeseriesViewNew
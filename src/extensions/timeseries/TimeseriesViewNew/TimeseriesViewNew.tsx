import React, { useReducer } from 'react';
import Splitter from '../../common/Splitter';
import { HitherContext, RecordingInfo, RecordingSelection, RecordingSelectionDispatch, recordingSelectionReducer } from '../../extensionInterface';
import ElectrodeGeometryView from './ElectrodeGeometryView';
import TimeseriesWidgetNew from './TimeseriesWidgetNew';
import useTimeseriesData from './useTimeseriesModel';

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
    recordingSelection?: RecordingSelection
    recordingSelectionDispatch?: RecordingSelectionDispatch
}

// interface TimeseriesInfo {
//     samplerate: number
//     segment_size: number
//     num_channels: number
//     channel_ids: number[]
//     channel_locations: (number[])[]
//     num_timepoints: number
//     y_offsets: number[]
//     y_scale_factor: number
//     initial_y_scale_factor: number
// }

type StatusString = 'waiting' | 'calculating' | 'error' | 'finished'

const TimeseriesViewNew = (props: Props) => {
    const opts = props.opts
    const timeseriesData = useTimeseriesData(props.recordingObject, props.recordingInfo, props.hither)
    const [recordingSelectionInternal, recordingSelectionInternalDispatch] = useReducer(recordingSelectionReducer, {})

    const recordingSelection = props.recordingSelection || recordingSelectionInternal
    const recordingSelectionDispatch = props.recordingSelectionDispatch || recordingSelectionInternalDispatch
    const selectedElectrodeIds = recordingSelection.selectedElectrodeIds || []

    const y_scale_factor = 1 / (props.recordingInfo.noise_level || 1) * 1/10

    if (timeseriesData) {
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
                                onSelectedElectrodeIdsChanged={(x: number[]) => {recordingSelectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: x})}}
                            />
                        )
                    }
                    {
                        ((!opts.channelSelectPanel) || (selectedElectrodeIds.length > 0)) ? (
                            <TimeseriesWidgetNew
                                timeseriesData={timeseriesData}
                                channel_ids={props.recordingInfo.channel_ids}
                                channel_locations={props.recordingInfo.geom}
                                num_timepoints={props.recordingInfo.num_frames}
                                // y_offsets={timeseriesInfo.y_offsets}
                                // y_scale_factor={timeseriesInfo.y_scale_factor * (timeseriesInfo.initial_y_scale_factor || 1)}
                                y_scale_factor={y_scale_factor}
                                width={props.width} // filled in above
                                height={props.height} // filled in above
                                visibleChannelIds={opts.channelSelectPanel ? selectedElectrodeIds : null}
                                recordingSelection={recordingSelection}
                                recordingSelectionDispatch={recordingSelectionDispatch}
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
            <div>Creating timeseries model</div>
        )
    }
}

// const calculateTimeseriesInfo = async (recordingObject: RecordingObject, hither: HitherContext): Promise<TimeseriesInfo> => {
//     let info: TimeseriesInfo
//     try {
//         info = await hither.createHitherJob(
//             'createjob_calculate_timeseries_info',
//             { recording_object: recordingObject },
//             {
//                 useClientCache: true
//             }
//         ).wait() as TimeseriesInfo
//     }
//     catch (err) {
//         console.error(err);
//         throw Error('Problem calculating timeseries info.')
//     }
//     if (!info) {
//         throw Error('Unexpected problem calculating timeseries info: info is null.')
//     }
//     return info
// }

export default TimeseriesViewNew
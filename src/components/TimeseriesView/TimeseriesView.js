import React, { useEffect, useState } from 'react';
import Mda from './Mda';
import TimeseriesWidget from "./TimeseriesWidget";
import TimeseriesModel from "./TimeseriesModel";
import { createHitherJob } from '../../hither';
import CalculationPool from '../../extensions/common/CalculationPool';
import { sleepMsec } from '../../hither/createHitherJob';
const TimeseriesView = ({
    width, height, maxWidth, maxHeight,
    recordingObject
}) => {
    // handle filter opts stuff
    const leftPanels = [];
    return (
        <TimeseriesViewInner
            width={width}
            height={height}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            leftPanels={leftPanels}
            recordingObject={recordingObject}
        />
    );
}

const timeseriesCalculationPool = new CalculationPool({maxSimultaneous: 4, method: 'stack'});

const TimeseriesViewInner = ({
    width, height, maxWidth, maxHeight,
    leftPanels,
    recordingObject
}) => {

    const [timeseriesInfo, setTimeseriesInfo] = useState(null);
    const [status, setStatus] = useState('pending');
    const [statusMessage, setStatusMessage] = useState(null);
    const [timeseriesModel, setTimeseriesModel] = useState(null);
    const [widgetKey, setWidgetKey] = useState(0);

    const effect = async () => {
        if ((!timeseriesInfo) && (status !== 'error')) {
            let info;
            setStatus('calculating');
            setStatusMessage('Calculating timeseries info');
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
                setStatusMessage('Problem calculating timeseries info.');
                setStatus('error');
                return;
            }
            if (!info) {
                setStatusMessage('Unepected problem calculating timeseries info: info is null.');
                setStatus('error');
                return;
            }
            setTimeseriesInfo(info);
            setStatusMessage('Setting timeseries model');
            const model = new TimeseriesModel({
                samplerate: info.samplerate,
                num_channels: info.num_channels,
                num_timepoints: info.num_timepoints,
                segment_size: info.segment_size
            });
            model.onRequestDataSegment(async (ds_factor, segment_num) => {
                let result;
                const slot = await timeseriesCalculationPool.requestSlot();
                try {
                    const resultJob = await createHitherJob(
                        'get_timeseries_segment',
                        {
                            recording_object: recordingObject,
                            ds_factor: ds_factor,
                            segment_num: segment_num,
                            segment_size: info.segment_size
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
                model.setDataSegment(ds_factor, segment_num, X);
            });
            setTimeseriesModel(model);
            setWidgetKey(Math.random());
            setStatus('finished');
        }
    }
    useEffect(() => { effect(); });

    // render
    if (status === 'pending') {
        return <div>Waiting...</div>;
    }
    else if (status === 'calculating') {
        return <div>{`${statusMessage}`}</div>;
    }
    else if (status === 'error') {
        return <div>{`Error: ${statusMessage}`}</div>;
    }

    if (status !== 'finished') {
        return <div>{`Unexpected status: ${status}`}</div>
    }

    const width0 = Math.min(width, maxWidth || 99999);
    const height0 = Math.min(height || 800, maxHeight || 99999);
    return (
        <div>
            <TimeseriesWidget
                key={widgetKey}
                timeseriesModel={timeseriesModel}
                num_channels={timeseriesInfo.num_channels}
                channel_ids={timeseriesInfo.channel_ids}
                channel_locations={timeseriesInfo.channel_locations}
                num_timepoints={timeseriesInfo.num_timepoints}
                y_offsets={timeseriesInfo.y_offsets}
                y_scale_factor={timeseriesInfo.y_scale_factor * (timeseriesInfo.initial_y_scale_factor || 1)}
                width={width0}
                height={height0}
                leftPanels={leftPanels}
            />
        </div>
    )
}

// class OldTimeseriesViewFO extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             filterOpts: props.filterOpts || { type: 'none', freq_min: 300, freq_max: 6000, freq_wid: 1000 }
//         };
//     }
//     render() {
//         // let leftPanels = [
//         //     {
//         //         key: 'filter-options',
//         //         title: "Filter options",
//         //         icon: <FilterOptsIcon />,
//         //         render: () => (
//         //             <FilterOpts
//         //                 filterOpts={this.state.filterOpts}
//         //                 onChange={(newOpts) => {this.setState({filterOpts: newOpts})}}
//         //             />
//         //         )
//         //     }
//         // ];
//         let leftPanels = [];
//         // let fo = {type: 'none', freq_min: 300, freq_max: 6000, freq_wid: 1000};
//         return (
//             <TimeseriesViewInner
//                 {...this.props}
//                 key={keyFromObject(this.state.filterOpts)}
//                 filterOpts={this.state.filterOpts}
//                 // filterOpts={fo}
//                 leftPanels={leftPanels}
//             />
//         );
//     }
// }

// function keyFromObject(obj) {
//     return JSON.stringify(obj);
// }

// const OldTimeseriesViewInner = ({ timeseriesModel, timeseriesInfo, leftPanels, width, height, maxWidth, maxHeight }) => {
//     // useEffect(() => {
//     //     if (!timeseriesModel) return;
//     //     if (!this.state.num_channels) return;
//     //     if (!this.timeseriesModel) {
//     //         if (!this.state.samplerate) {
//     //             return;
//     //         }
//     //         const params = {
//     //             samplerate: this.state.samplerate,
//     //             num_channels: this.state.num_channels,
//     //             num_timepoints: this.state.num_timepoints,
//     //             segment_size: this.state.segment_size
//     //         };
//     //         this.timeseriesModel = new TimeseriesModel(params);
//     //         this.timeseriesModel.onRequestDataSegment((ds_factor, segment_num) => {
//     //             this.pythonInterface.sendMessage({
//     //                 command: 'requestSegment',
//     //                 ds_factor: ds_factor,
//     //                 segment_num: segment_num
//     //             });
//     //         });
//     //         this.setState({
//     //             timeseriesModelSet: this.state.timeseriesModelSet + 1
//     //         });
//     //     }
//     // })
//     if (timeseriesModel) {
//         const width0 = Math.min(width, maxWidth || 99999);
//         const height0 = Math.min(height || 800, maxHeight || 99999);
//         return (
//             <div>
//                 <TimeseriesWidget
//                     timeseriesModel={timeseriesModel}
//                     num_channels={timeseriesInfo.num_channels}
//                     channel_ids={timeseriesInfo.channel_ids}
//                     channel_locations={timeseriesInfo.channel_locations}
//                     num_timepoints={timeseriesInfo.num_timepoints}
//                     y_offsets={timeseriesInfo.y_offsets}
//                     y_scale_factor={timeseriesInfo.y_scale_factor * (timeseriesInfo.initial_y_scale_factor || 1)}
//                     width={width0}
//                     height={height0}
//                     leftPanels={leftPanels}
//                 />
//             </div>
//         )
//     }
//     else {
//         return (
//             <div>TimeseriesView</div>
//         );
//     }
// }

/*
class TimeseriesViewInnerOld extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // javascript state
            recording: null,

            // python state
            num_channels: null,
            channel_locations: null,
            channel_ids: null,
            num_timepoints: null,
            channel_ids: null,
            samplerate: null,
            y_offsets: null,
            y_scale_factor: null,
            segment_size: null,
            status_message: '',

            // other
            timeseriesModelSet: 0 // to trigger re-render
        }
        this.timeseriesModel = null;
    }

    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.onMessage((msg) => {
            if (msg.command == 'setSegment') {
                let X = new Mda();
                X.setFromBase64(msg.data);
                this.timeseriesModel.setDataSegment(msg.ds_factor, msg.segment_num, X);
            }
        })
        let recording = this.props.recording;
        if (this.props.filterOpts.type === 'bandpass_filter') {
            recording = {
                recording: recording,
                filters: [
                    this.props.filterOpts
                ]
            };
        }
        this.pythonInterface.setState({
            recording: recording
        });

        this.pythonInterface.start();
        this.updateData();
    }
    componentDidUpdate(prevProps, prevState) {
        this.updateData();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }

    updateData() {
        if (!this.state.num_channels) return;
        if (!this.timeseriesModel) {
            if (!this.state.samplerate) {
                return;
            }
            const params = {
                samplerate: this.state.samplerate,
                num_channels: this.state.num_channels,
                num_timepoints: this.state.num_timepoints,
                segment_size: this.state.segment_size
            };
            this.timeseriesModel = new TimeseriesModel(params);
            this.timeseriesModel.onRequestDataSegment((ds_factor, segment_num) => {
                this.pythonInterface.sendMessage({
                    command: 'requestSegment',
                    ds_factor: ds_factor,
                    segment_num: segment_num
                });
            });
            this.setState({
                timeseriesModelSet: this.state.timeseriesModelSet + 1
            });
        }
    }
    render() {
        if (this.timeseriesModel) {
            let leftPanels = [];
            for (let lp of this.props.leftPanels)
                leftPanels.push(lp);
            let width = Math.min(this.props.width, this.props.maxWidth || 99999);
            let height = Math.min(this.props.height || 800, this.props.maxHeight || 99999);
            return (
                <div>
                    <TimeseriesWidget
                        timeseriesModel={this.timeseriesModel}
                        num_channels={this.state.num_channels}
                        channel_ids={this.state.channel_ids}
                        channel_locations={this.state.channel_locations}
                        num_timepoints={this.state.num_timepoints}
                        y_offsets={this.state.y_offsets}
                        y_scale_factor={this.state.y_scale_factor * (this.props.initial_y_scale_factor || 1)}
                        width={width}
                        height={height}
                        leftPanels={leftPanels}
                    />
                </div>
            )
        }
        else {
            return (
                <div>Loading timeseries... {this.state.status_message}</div>
            );
        }
    }
}
*/

export default TimeseriesView;
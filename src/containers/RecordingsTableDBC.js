import React, { useEffect } from "react";
import MaterialTable from "material-table";

import { connect } from 'react-redux'
import { deleteRecordings, setRecordingInfo, sleep } from '../actions';
import { createHitherJob } from '../hither';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { getPathQuery } from "../kachery";


const RecordingsTableDBC = ({ recordings, onDeleteRecordings, onSetRecordingInfo, documentInfo }) => {
    const { documentId, feedUri, readOnly } = documentInfo;

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    recordings = sortByKey(recordings, 'recordingLabel');

    const effect = async () => {
        for (const rec of recordings) {
            if (!rec.recordingInfo) {
                let info;
                try {
                    // for a nice gui effect
                    await sleep(400);
                    const recordingInfoJob = await createHitherJob(
                        'get_recording_info',
                        { recording_object: rec.recordingObject },
                        {
                            kachery_config: {},
                            hither_config: {
                            },
                            job_handler_name: 'default',
                            auto_substitute_file_objects: false,
                            useClientCache: true
                        }
                    )
                    info = await recordingInfoJob.wait();
                    onSetRecordingInfo({ recordingId: rec.recordingId, recordingInfo: info });
                }
                catch (err) {
                    console.error(err);
                    return;
                }
            }
        }
    }
    useEffect(() => { effect() })


    const rows = recordings.map(rec => ({
        recording: rec,
        key: rec.recordingId,
        // recordingLabel: rec.recordingLabel,
        recordingLabel: <Link title={"View this recording"} to={`/${documentId}/recording/${rec.recordingId}${getPathQuery({feedUri})}`}>{rec.recordingLabel}</Link>,
        numChannels: rec.recordingInfo ? rec.recordingInfo.channel_ids.length : {element: <CircularProgress />},
        samplingFrequency: rec.recordingInfo ? rec.recordingInfo.sampling_frequency : 'N/A',
        durationMinutes: rec.recordingInfo ? rec.recordingInfo.num_frames / rec.recordingInfo.sampling_frequency / 60 : 'N/A'
    }));

    const columns = [
      { title: "File", field: "recordingLabel" },
      { title: "numChannels", field: "numChannels" },
      { title: "Sample Rate (Hz)", field: "samplingFrequency" },
      { title: "Duration (min)", field: "durationMinutes" }, 
    ]

  return (
    <MaterialTable

      title="Recording Database"
      columns={columns}
      data= {rows}
      actions={[
        
        {
          icon: "forward",
          iconProps: {color: "secondary"},          
          tooltip: "Run spikesorting",
          onClick: (event, rowData) => {
            // Do save operation
          }

        },    
        {
          icon: 'save',
          tooltip: 'Save to local drive',
          onClick: (event, rowData) => {
            // Do save operation
          }
        },
        {
            icon: 'delete',
            tooltip: 'Delete recording',
            onClick: (event, rowData) => {
                // has error after delete, the original row becomes empty and it cannot render
                onDeleteRecordings([rowData.key])
            }
          }
      ]}
    //   editable={{
    //     onRowAdd: (newData) =>
    //       new Promise((resolve) => {
    //         setTimeout(() => {
    //           resolve();
    //           setState((prevState) => {
    //             const data = [...prevState.data];
    //             data.push(newData);
    //             return { ...prevState, data };
    //           });
    //         }, 600);
    //       }),
    //     onRowUpdate: (newData, oldData) =>
    //       new Promise((resolve) => {
    //         setTimeout(() => {
    //           resolve();
    //           if (oldData) {
    //             setState((prevState) => {
    //               const data = [...prevState.data];
    //               data[data.indexOf(oldData)] = newData;
    //               return { ...prevState, data };
    //             });
    //           }
    //         }, 600);
    //       }),
    //     onRowDelete: (oldData) =>
    //       new Promise((resolve) => {
    //         setTimeout(() => {
    //           resolve();
    //           setState((prevState) => {
    //             const data = [...prevState.data];
    //             data.splice(data.indexOf(oldData), 1);
    //             return { ...prevState, data };
    //           });
    //         }, 600);
    //       }),
    //   }}
    />
  );
};

const mapStateToProps = state => ({
    recordings: state.recordings,
    documentInfo: state.documentInfo.documentInfo
})

const mapDispatchToProps = dispatch => ({
    onDeleteRecordings: recordingIds => dispatch(deleteRecordings(recordingIds)),
    onSetRecordingInfo: ({ recordingId, recordingInfo }) => dispatch(setRecordingInfo({ recordingId, recordingInfo }))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RecordingsTableDBC);


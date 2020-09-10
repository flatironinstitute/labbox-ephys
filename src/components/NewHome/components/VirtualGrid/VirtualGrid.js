import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { deleteRecordings, setRecordingInfo } from '../../../../actions';
import { getRecordingInfo } from '../../../../actions/getRecordingInfo';
import { makeStyles, useTheme } from '@material-ui/core'
import LinearProgress from '@material-ui/core/LinearProgress';
import MaterialTable from 'material-table'
import GetAppIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SpikeSortingButton from './components/SpikeSortingButton'
import GridActions from './components/GridActions/GridActions';
import SampleRate from './components/SampleRate/SampleRate';
import { Link } from 'react-router-dom';
import { getPathQuery } from '../../../../kachery';

const useStyles = makeStyles((theme) => ({
    progress: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    button: ({ darkMode }) => ({
        color: darkMode
            ? theme.palette.colors.white
            : theme.palette.colors.grey
    }),
    link: ({ darkMode }) => ({
        color: darkMode
            ? theme.palette.colors.white
            : theme.palette.primary.main
    })
}))

const VirtualGrid = ({ recordings, onDeleteRecordings, onSetRecordingInfo, documentInfo }) => {
    const { documentId, feedUri } = documentInfo
    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'
    const classes = useStyles({ darkMode })

    /*will use them after resolving web socket issue */
    const effect = async () => {
        for (const rec of recordings) {
            if (!rec.recordingInfo) {
                try {
                    const info = await getRecordingInfo({ recordingObject: rec.recordingObject });
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

    const rows = recordings.map(rec => {
        return {
            id: rec.recordingId,
            file: rec ? rec.recordingLabel : '',
            //uploadRate: rec.recordingInfo ? rec.recordingInfo.channel_ids.length : '',
            sampleRate: rec.recordingInfo ? rec.recordingInfo.sampling_frequency : '',
            duration: rec.recordingInfo ? rec.recordingInfo.num_frames / rec.recordingInfo.sampling_frequency / 60 : ''
        }
    });




    /*     const rows = 
        recordings.map(row => ({
            id: row.recordingId,
            file: row.recordingLabel,
            duration: row.recordingObject ? row.recordingObject.data.num_frames / row.recordingObject.data.samplerate / 60 : '',
            sampleRate: row.recordingObject ? row.recordingObject.data.samplerate : '',
        })) */

    /*need to implement action on single row and on bulk actions*/
    //rowData on single actions is an object, on bulk actios it is an array of objects
    const handleDelete = (event, rowData) => {
        return alert("You want to delete " + rowData.file)
    }
    const handleExport = (event, rowData) => alert("You exported " + rowData.file)
    const handleEdit = (event, rowData) => alert("edit file " + rowData.file)
    
    return (
        <MaterialTable
            columns={[
                {
                    title: 'File',
                    field: 'file',
                    align: 'left',
                    render: (rowData) => rowData.file
                        ? (
                            <Link
                                title={"View this recording"}
                                to={`/${documentId}/recording/${rowData.id}${getPathQuery({ feedUri })}`}
                                className={classes.link}
                            >
                                {rowData.file}
                            </Link>
                        )
                        : <LinearProgress />
                },
                { title: 'Upload Date', field: 'uploadRate', align: 'left' },
                {
                    title: 'Sample Rate (Hz)',
                    field: 'sampleRate',
                    align: 'left',
                    render: (rowData) => rowData.sampleRate
                        ? <SampleRate label={rowData.sampleRate} />
                        : <LinearProgress />
                },
                {
                    title: 'Duration (sec)',
                    field: 'duration',
                    align: 'left',
                    render: (rowData) => rowData.duration
                        ? rowData.duration
                        : <LinearProgress />
                },
                { title: 'Status', field: 'status', align: 'left' },
                {
                    title: 'Sorting',
                    field: 'sorting',
                    render: (rowData) =>
                        !rowData.sampleRate
                            ? <LinearProgress />
                            : rowData.sampleRate >= 30000
                                ? <SpikeSortingButton rowData={rowData} />
                                : null
                    ,
                    align: 'center'
                },
                {
                    title: 'Actions',
                    field: 'actions',
                    align: 'center',
                    render: (rowData) => {
                        return <GridActions
                            className={classes.button}
                            handleDelete={onDeleteRecordings}
                            handleEdit={handleEdit}
                            handleExport={handleExport}
                            rowData={rowData}
                        />
                    }
                }
            ]}
            /*need it for bulk actions */
            actions={
                [
                    {
                        icon: () => <GetAppIcon className={classes.button} />,
                        tooltip: 'Export File',
                        onClick: handleExport,
                    },
                    {
                        icon: () => <DeleteIcon className={classes.button} />,
                        tooltip: 'Delete File',
                        onClick: handleDelete,
                    },
                    {
                        icon: () => <EditIcon className={classes.button} />,
                        tooltip: 'Edit File',
                        onClick: handleEdit,
                    }
                ]}
            options={{
                actionsColumnIndex: -1,
                selection: true,
                selectionProps: rowData => ({
                    color: 'primary'
                })
            }}
            data={rows}
            title="Recording Database"
        />
    )
}

const mapStateToProps = state => ({
    recordings: state.recordings,
    documentInfo: state.documentInfo
})

const mapDispatchToProps = dispatch => ({
    onDeleteRecordings: recordingIds => dispatch(deleteRecordings(recordingIds)),
    onSetRecordingInfo: ({ recordingId, recordingInfo }) => dispatch(setRecordingInfo({ recordingId, recordingInfo }))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VirtualGrid)

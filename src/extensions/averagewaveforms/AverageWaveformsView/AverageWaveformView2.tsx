import { faWater } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, CircularProgress } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import createCalculationPool from '../../common/createCalculationPool';
import useHitherJob from '../../common/useHitherJob';
import { HitherJob, Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import AverageWaveformWidget from './AverageWaveformWidget';

type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

type Props = {
    sorting: Sorting
    recording: Recording
    unitId: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
    noiseLevel: number
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const HitherJobStatusView: FunctionComponent<{job?: HitherJob, width?: number, height?: number}> = ({job, width=200, height=200}) => {
    if (!job) return <div>No job</div>
    return (
        <Box display="flex" width={width} height={height}>
            <Box m="auto">
                {
                    job.status === 'running' ? (
                        <CircularProgress />
                    ): job.status === 'error' ? (
                        <span>Error: {job.error_message}</span>
                    ) : job.status === 'pending' ? (
                        <FontAwesomeIcon icon={faWater} />
                    ) : (
                        <span>{job.status}</span>
                    )
                }
            </Box>
        </Box>
    )
}

const AverageWaveformView2: FunctionComponent<Props> = ({ sorting, recording, unitId, selection, selectionDispatch, width, height, noiseLevel }) => {
    const {result: plotData, job} = useHitherJob<PlotData>(
        'createjob_fetch_average_waveform_2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: unitId
        },
        {useClientCache: true, calculationPool}
    )

    if (!plotData) {
        return <HitherJobStatusView job={job} width={width} height={height} />
    }
    return (
        <AverageWaveformWidget
            waveform={plotData.average_waveform}
            noiseLevel={noiseLevel}
            electrodeIds={plotData.channel_ids}
            electrodeLocations={plotData.channel_locations}
            samplingFrequency={plotData.sampling_frequency}
            width={width}
            height={height}
            selection={selection}
            selectionDispatch={selectionDispatch}
        />
    )
}

export default AverageWaveformView2
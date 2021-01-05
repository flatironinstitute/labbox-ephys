import { GridList, GridListTile } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { createCalculationPool, HitherJobStatusView, useHitherJob } from '../../common/hither';
import { Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import SnippetBox from './SnippetBox';


type Props = {
    recording: Recording
    sorting: Sorting
    noiseLevel: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    unitId: number
    height: number
}

export type Snippet = {
    timepoint: number
    waveform: number[][]
}

type SnippetsResult = {
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
    snippets: Snippet[]
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const SnippetsWidgetBox: FunctionComponent<Props> = ({ recording, sorting, selection, selectionDispatch, unitId, height, noiseLevel }) => {
    const {result: snippetsResult, job} = useHitherJob<SnippetsResult>(
        'createjob_get_sorting_unit_snippets',
        {
            recording_object: recording.recordingObject,
            sorting_object: sorting.sortingObject,
            unit_id: unitId,
            max_num_snippets: 20
        },
        {
            useClientCache: true,
            calculationPool
        }
    )
    if (!snippetsResult) {
        return <HitherJobStatusView job={job} width={200} height={height} />
    }
    return (
        <GridList style={{flexWrap: 'nowrap'}}>
            {
                snippetsResult.snippets.map((snippet) => (
                    <GridListTile key={snippet.timepoint}>
                        <SnippetBox
                            snippet={snippet}
                            noiseLevel={noiseLevel}
                            samplingFrequency={snippetsResult.sampling_frequency}
                            electrodeIds={snippetsResult.channel_ids}
                            electrodeLocations={snippetsResult.channel_locations}
                            selection={selection}
                            selectionDispatch={selectionDispatch}
                            width={80}
                            height={height}
                        />
                    </GridListTile>
                ))
            }
        </GridList>
    )
}

export default SnippetsWidgetBox
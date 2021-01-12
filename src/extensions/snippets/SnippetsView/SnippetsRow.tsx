import { GridList, GridListTile } from '@material-ui/core';
import React, { FunctionComponent, useContext, useMemo } from 'react';
import { getElectrodesAspectRatio } from '../../averagewaveforms/AverageWaveformsView/setupElectrodes';
import { createCalculationPool, HitherContext, HitherInterface } from '../../common/hither';
import useFetchCache from '../../common/useFetchCache';
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
    index: number
    unitId: number
    waveform?: number[][]
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

type InfoType = {
    sampling_frequency: number
    channel_ids: number[]
    channel_locations: number[][]
}

type InfoQuery = {
    type: 'info'
    recording: Recording
    sorting: Sorting
    unitId: number
}

type SnippetsQuery = {
    type: 'snippets'
    recording: Recording
    sorting: Sorting
    unitId: number
    timeRange: {min: number, max: number}
}

type QueryType = InfoQuery | SnippetsQuery

const getSnippetsInfo = async (args: {recording: Recording, sorting: Sorting, unitId: number, hither: HitherInterface}): Promise<InfoType> => {
    const { recording, sorting, unitId, hither } = args
    const result = await hither.createHitherJob(
        'createjob_get_sorting_unit_info',
        {
            recording_object: recording.recordingObject,
            sorting_object: sorting.sortingObject,
            unit_id: unitId
        },
        {
            useClientCache: true,
            calculationPool
        }
    ).wait() as {
        channel_ids: number[]
        channel_locations: number[][]
        sampling_frequency: number
    }
    return {
        channel_ids: result.channel_ids,
        channel_locations: result.channel_locations,
        sampling_frequency: result.sampling_frequency
    }
}

const getSnippets = async (args: {recording: Recording, sorting: Sorting, unitId: number, timeRange: {min: number, max: number}, hither: HitherInterface}): Promise<Snippet[]> => {
    const { recording, sorting, unitId, timeRange, hither } = args
    const result = await hither.createHitherJob(
        'createjob_get_sorting_unit_snippets',
        {
            recording_object: recording.recordingObject,
            sorting_object: sorting.sortingObject,
            unit_id: unitId,
            time_range: timeRange,
            max_num_snippets: 1000
        },
        {
            useClientCache: true,
            calculationPool
        }
    ).wait() as {
        channel_ids: number[]
        channel_locations: number[][]
        sampling_frequency: number
        snippets: Snippet[]
    }
    return result.snippets
}

const segmentSize = 30000 * 10
const createTimeSegments = (timeRange: {min: number, max: number} | null, opts: {maxNumSegments: number}) => {
    const ret = [] as {min: number, max: number}[]
    if (!timeRange) return ret
    const i1 = Math.floor(timeRange.min / segmentSize)
    const i2 = Math.ceil(timeRange.max / segmentSize)
    for (let i = i1; i <= Math.min(i2, i1 + opts.maxNumSegments -1); i++) {
        ret.push({min: i * segmentSize, max: (i+1) * segmentSize})
    }
    return ret
}

const useSnippets = (args: {recording: Recording, sorting: Sorting, visibleElectrodeIds: number[] | undefined, unitId: number, timeRange: {min: number, max: number} | null}) => {
    const hither = useContext(HitherContext)
    const { recording, sorting, visibleElectrodeIds, unitId, timeRange } = args
    const fetchFunction = useMemo(() => (
        async (query: QueryType) => {
            switch(query.type) {
                case 'info': return await getSnippetsInfo({recording: query.recording, sorting: query.sorting, unitId: query.unitId, hither})
                case 'snippets': return await getSnippets({recording: query.recording, sorting: query.sorting, unitId: query.unitId, timeRange: query.timeRange, hither})
            }
        }
    ), [hither])
    const data = useFetchCache<QueryType>(fetchFunction)
    return useMemo(() => {
        const infoQuery: InfoQuery = {type: 'info', recording, sorting, unitId}
        // const snippetsQuery: SnippetsQuery = {type: 'snippets', recording, sorting, unitId}
        const info = data.get(infoQuery) as InfoType | undefined
        const timeSegments: {min: number, max: number}[] = createTimeSegments(timeRange, {maxNumSegments: 6})
        const snippetsList: (Snippet[] | undefined)[] = timeSegments.map(timeSegment => {
            const snippetsQuery: SnippetsQuery = {
                type: 'snippets',
                recording,
                sorting,
                unitId,
                timeRange: timeSegment
            }
            return data.get(snippetsQuery)
        })
        const snippets = snippetsList.filter(s => (s === undefined)).length === 0 ? (
            snippetsList.reduce((acc, val) => (
                val !== undefined ? acc?.concat(val) : acc
            ), [] as Snippet[])
        )?.map(s => (filterSnippetVisibleElectrodes(s, info?.channel_ids, visibleElectrodeIds))) : undefined
        const snippetsInRange = snippets ? (
            snippets.filter((s) => ((timeRange) && (timeRange.min <= s.timepoint) && (s.timepoint < timeRange.max)))
        ) : undefined
        return {
            info: info ? {
                ...info,
                channel_ids: info.channel_ids.filter((eid, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(info.channel_ids[ii])))),
                channel_locations: info.channel_locations.filter((loc, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(info.channel_ids[ii])))),
            } : undefined,
            snippets: snippetsInRange
        }
    }, [data, recording, sorting, timeRange, unitId, visibleElectrodeIds])
}

const filterSnippetVisibleElectrodes = (s: Snippet, electrodeIds: number[] | undefined, visibleElectrodeIds: number[] | undefined) => {
    if (!electrodeIds) return s
    if (!visibleElectrodeIds) return s
    return {
        ...s,
        waveform: s.waveform?.filter((x, i) => (visibleElectrodeIds.includes(electrodeIds[i])))
    }
}

const SnippetsRow: FunctionComponent<Props> = ({ recording, sorting, selection, selectionDispatch, unitId, height, noiseLevel }) => {
    const {snippets, info} = useSnippets({recording, sorting, visibleElectrodeIds: selection.visibleElectrodeIds, unitId, timeRange: selection.timeRange || null})
    const electrodeLocations = info?.channel_locations
    const boxWidth = useMemo(() => {
        const boxAspect = (electrodeLocations ? getElectrodesAspectRatio(electrodeLocations) : 1) || 1
        return (boxAspect > 1 ? height / boxAspect : height * boxAspect)
    }, [electrodeLocations, height])
    return (
        <GridList style={{flexWrap: 'nowrap', height: height + 15}}>
            {
                info && electrodeLocations && snippets ? (
                    snippets.map((snippet) => (
                        <GridListTile key={snippet.timepoint} style={{width: boxWidth + 5, height: height + 15}}>
                            <SnippetBox
                                snippet={snippet}
                                noiseLevel={noiseLevel}
                                samplingFrequency={info.sampling_frequency}
                                electrodeIds={info.channel_ids}
                                electrodeLocations={electrodeLocations}
                                selection={selection}
                                selectionDispatch={selectionDispatch}
                                width={boxWidth}
                                height={height}
                            />
                        </GridListTile>
                    ))
                ) : (
                    <GridListTile style={{width: 180}}>
                        <div style={{whiteSpace: 'nowrap'}}>Retrieving snippets...</div>
                    </GridListTile>
                )
            }
        </GridList>
    )
}

export default SnippetsRow
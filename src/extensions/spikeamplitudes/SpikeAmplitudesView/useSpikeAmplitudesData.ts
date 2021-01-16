import { useContext, useMemo } from "react"
import { createCalculationPool, HitherContext, HitherInterface } from "../../common/hither"
import useFetchCache from "../../common/useFetchCache"

export type SpikeAmplitudesData = {
    getSpikeAmplitudes: (unitId: number) => {timepoints: number[], amplitudes: number[]}
}

type SpikeAmplitudesDataQuery = {
    type: 'spikeAmplitudes',
    unitId: number
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const fetchSpikeAmplitudes = async ({hither, recordingObject, sortingObject, unitId}: {hither: HitherInterface, recordingObject: any, sortingObject: any, unitId: number}) => {
    const result = await hither.createHitherJob(
        'createjob_fetch_spike_amplitudes',
        {
            recording_object: recordingObject,
            sorting_object: sortingObject,
            unit_id: unitId
        },
        {
            useClientCache: true,
            calculationPool
        }
    ).wait() as {
        timepoints: number[]
        amplitudes: number[]
    }
    return result
}

const useSpikeAmplitudesData = (recordingObject: any, sortingObject: any): SpikeAmplitudesData | null => {
    const hither = useContext(HitherContext)
    const fetch = useMemo(() => (async (query: SpikeAmplitudesDataQuery) => {
        switch(query.type) {
            case 'spikeAmplitudes': {
                return await fetchSpikeAmplitudes({hither, recordingObject, sortingObject, unitId: query.unitId})
            }
            default: throw Error('Unexpected query type')
        }
    }), [hither, recordingObject, sortingObject])
    const data = useFetchCache<SpikeAmplitudesDataQuery>(fetch)

    const getSpikeAmplitudes = useMemo(() => ((unitId: number) => {
        return data.get({type: 'spikeAmplitudes', unitId})
    }), [data])

    return useMemo(() => ({
        getSpikeAmplitudes
    }), [getSpikeAmplitudes])
}

export default useSpikeAmplitudesData
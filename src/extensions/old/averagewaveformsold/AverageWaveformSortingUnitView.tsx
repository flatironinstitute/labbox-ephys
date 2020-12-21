import React, { FunctionComponent } from 'react'
import ClientSidePlot from '../../common/ClientSidePlot'
import { CalculationPool, HitherContext, Recording, Sorting } from '../../extensionInterface'
import AverageWaveform_rv from './AverageWaveform_ReactVis'


const AverageWaveformSortingUnitView: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool, hither: HitherContext}> = ({ sorting, recording, unitId, calculationPool, hither }) => {
    return (
        <ClientSidePlot
            dataFunctionName={'createjob_fetch_average_waveform_plot_data'}
            dataFunctionArgs={{
                sorting_object: sorting.sortingObject,
                recording_object: recording.recordingObject,
                unit_id: unitId
            }}
            boxSize={{
                width: 300,
                height: 300
            }}
            PlotComponent={AverageWaveform_rv}
            plotComponentArgs={{ id: unitId }}
            newHitherJobMethod={true}
            useJobCache={true}
            requiredFiles={sorting.sortingObject}
            calculationPool={calculationPool}
            title=""
            hither={hither}
        />
    )
}

export default AverageWaveformSortingUnitView
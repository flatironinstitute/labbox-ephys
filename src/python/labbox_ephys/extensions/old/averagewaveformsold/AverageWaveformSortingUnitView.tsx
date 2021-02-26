import { CalculationPool } from 'labbox'
import React, { FunctionComponent } from 'react'
import ClientSidePlot from '../../common/ClientSidePlot'
import { Recording, Sorting } from "../../pluginInterface"
import AverageWaveform_rv from './AverageWaveform_ReactVis'


const AverageWaveformSortingUnitView: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool}> = ({ sorting, recording, unitId, calculationPool }) => {
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
            calculationPool={calculationPool}
            title=""
        />
    )
}

export default AverageWaveformSortingUnitView
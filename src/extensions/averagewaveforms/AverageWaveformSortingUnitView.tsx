import React, { FunctionComponent } from 'react'
import ClientSidePlot from '../../components/ClientSidePlot'
import CalculationPool from "../common/CalculationPool"
import { Recording } from "../../reducers/recordings"
import { Sorting } from "../../reducers/sortings"
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
            plotComponent={AverageWaveform_rv}
            plotComponentArgs={{ id: unitId }}
            newHitherJobMethod={true}
            useJobCache={true}
            requiredFiles={sorting.sortingObject}
            calculationPool={calculationPool}
            title=""
        />
    )
}

export default AverageWaveformSortingUnitView
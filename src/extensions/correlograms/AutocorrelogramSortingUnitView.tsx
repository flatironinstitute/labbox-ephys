import React, { FunctionComponent } from 'react'
import ClientSidePlot from "../../components/ClientSidePlot"
import CalculationPool from "../../pluginComponents/common/CalculationPool"
import { Sorting } from "../../reducers/sortings"
import Correlogram_rv from './Correlogram_ReactVis'


const AutocorrelogramSortingUnitView: FunctionComponent<{sorting: Sorting, unitId: number, calculationPool: CalculationPool}> = ({ sorting, unitId, calculationPool }) => {
    return (
        <ClientSidePlot
            dataFunctionName="createjob_fetch_correlogram_plot_data"
            dataFunctionArgs={{
                sorting_object: sorting.sortingObject,
                unit_x: unitId
            }}
            boxSize={{
                width: 300,
                height: 300
            }}
            title="Autocorrelogram"
            plotComponent={Correlogram_rv}
            plotComponentArgs={{ id: unitId }}
            newHitherJobMethod={true}
            useJobCache={true}
            requiredFiles={sorting.sortingObject}
            calculationPool={calculationPool}
        />
    )
}

export default AutocorrelogramSortingUnitView
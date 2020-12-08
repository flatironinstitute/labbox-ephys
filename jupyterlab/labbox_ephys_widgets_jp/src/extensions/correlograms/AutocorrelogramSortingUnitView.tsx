import React, { FunctionComponent } from 'react'
import ClientSidePlot from '../common/ClientSidePlot'
import { CalculationPool, HitherContext, Sorting } from '../extensionInterface'
import Correlogram_rv from './Correlogram_ReactVis'


const AutocorrelogramSortingUnitView: FunctionComponent<{sorting: Sorting, unitId: number, calculationPool: CalculationPool, hither: HitherContext}> = ({ sorting, unitId, calculationPool, hither }) => {
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
            hither={hither}
        />
    )
}

export default AutocorrelogramSortingUnitView
import React, { FunctionComponent, useMemo } from 'react'
import SortingUnitPlotGrid from '../../common/SortingUnitPlotGrid'
import { SortingViewProps } from "../../extensionInterface"
import IndividualClusterView from './IndividualClusterView'

const IndividualClustersView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch}) => {
    const unitComponent = useMemo(() => (unitId: number) => (
        <IndividualClusterView
            {...{recording, sorting, unitId, selection, selectionDispatch}}
            width={180}
            height={180}
        />
    ), [sorting, recording, selection, selectionDispatch])

    return (
        <SortingUnitPlotGrid
            sorting={sorting}
            selection={selection}
            selectionDispatch={selectionDispatch}
            unitComponent={unitComponent}
        />
    )
}

export default IndividualClustersView
import React, { FunctionComponent, useMemo } from 'react';
import SortingUnitPairPlotGrid from '../../common/SortingUnitPairPlotGrid';
import { Sorting, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import CorrelogramRv2 from '../Correlogram_ReactVis2';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    unitIds: number[]
    width: number
    height: number
}

const CrossCorrelogramsWidget: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch, unitIds, width, height }) => {
    const plotMargin = 10 // in pixels
    const n = unitIds.length || 1
    const plotWidth = Math.min(220, (width - (plotMargin * (n + 1))) / n)
    const plotHeight = plotWidth
    const unitPairComponent = useMemo(() => (unitId1: number, unitId2: number) => (
        <CorrelogramRv2
            sorting={sorting}
            selection={selection}
            selectionDispatch={selectionDispatch}
            unitId1={unitId1}
            unitId2={unitId2}
            width={plotWidth}
            height={plotHeight}
        />
    ), [sorting, selection, selectionDispatch, plotWidth, plotHeight])

    return (
        <SortingUnitPairPlotGrid
            sorting={sorting}
            selection={selection}
            selectionDispatch={selectionDispatch}
            unitIds={unitIds}
            unitPairComponent={unitPairComponent}
        />
    )
}

export default CrossCorrelogramsWidget
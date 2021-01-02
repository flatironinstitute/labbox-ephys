import React, { FunctionComponent } from 'react'
import Splitter from '../../common/Splitter'
import { SortingViewProps } from "../../extensionInterface"
import SelectUnitsWidget from '../../spikeamplitudes/SpikeAmplitudesView/SelectUnitsWidget'
import CrossCorrelogramsWidget from './CrossCorrelogramsWidget'

const CrossCorrelogramsView: FunctionComponent<SortingViewProps> = ({sorting, selection, selectionDispatch, width, height}) => {
    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} />
            <CrossCorrelogramsWidget
                sorting={sorting}
                selection={selection}
                selectionDispatch={selectionDispatch}
                unitIds={selection.selectedUnitIds || []}
                {...{width: 0, height: 0}} // filled in by splitter
            />
        </Splitter>
    )
}

export default CrossCorrelogramsView
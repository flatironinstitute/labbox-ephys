import React, { FunctionComponent } from 'react'
import Splitter from '../../common/Splitter'
import { SortingViewProps } from "../../pluginInterface"
import SelectUnitsWidget from '../../spikeamplitudes/SpikeAmplitudesView/SelectUnitsWidget'
import SnippetsWidget from './SnippetsWidget'

const SnippetsView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch, curation, width, height}) => {
    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} curation={curation} />
            <SnippetsWidget
                recording={recording}
                sorting={sorting}
                selection={selection}
                selectionDispatch={selectionDispatch}
                curation={curation}
                unitIds={selection.selectedUnitIds || []}
                {...{width: 0, height: 0}} // filled in by splitter
            />
        </Splitter>
    )
}

export default SnippetsView
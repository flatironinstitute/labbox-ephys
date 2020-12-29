import React, { FunctionComponent } from 'react'
import Splitter from '../../common/Splitter'
import { SortingViewProps } from "../../extensionInterface"
import SelectUnitsWidget from './SelectUnitsWidget'
import SpikeAmplitudesTimeWidget from './SpikeAmplitudesTimeWidget'

const SpikeAmplitudesView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch, hither, width, height}) => {
    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} />
            <SpikeAmplitudesTimeWidget
                recording={recording}
                sorting={sorting}
                unitIds={selection.selectedUnitIds || []}
                hither={hither}
                {...{width: 0, height: 0}} // filled in by splitter
                selection={selection}
                selectionDispatch={selectionDispatch}
            />
        </Splitter>
    )
}

export default SpikeAmplitudesView
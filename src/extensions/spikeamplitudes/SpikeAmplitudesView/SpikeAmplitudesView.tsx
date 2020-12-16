import React, { FunctionComponent } from 'react'
import sizeMe, { SizeMeProps } from 'react-sizeme'
import { SortingViewProps } from "../../extensionInterface"
import Splitter from '../../timeseries/TimeWidgetNew/Splitter'
import SelectUnitsWidget from './SelectUnitsWidget'
import SpikeAmplitudesTimeWidget from './SpikeAmplitudesTimeWidget'

const SpikeAmplitudesView: FunctionComponent<SortingViewProps & SizeMeProps> = ({recording, sorting, selection, selectionDispatch, size, hither, height}) => {
    return (
        <Splitter
            width={size.width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} />
            <SpikeAmplitudesTimeWidget
                recording={recording}
                sorting={sorting}
                unitIds={selection.selectedUnitIds}
                hither={hither}
                {...{width: 0, height: 0}} // filled in by splitter
            />
        </Splitter>
    )
}

export default sizeMe()(SpikeAmplitudesView)
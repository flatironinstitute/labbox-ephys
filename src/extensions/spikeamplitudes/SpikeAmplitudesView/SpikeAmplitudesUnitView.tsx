import React, { FunctionComponent } from 'react'
import { SortingUnitViewProps } from "../../extensionInterface"
import SpikeAmplitudesTimeWidget from './SpikeAmplitudesTimeWidget'

const SpikeAmplitudesUnitView: FunctionComponent<SortingUnitViewProps> = (props) => {
    return (
        <SpikeAmplitudesTimeWidget
            recording={props.recording}
            sorting={props.sorting}
            unitIds={[props.unitId]}
            hither={props.hither}
            {...{width: props.width || 500, height: props.height || 500}}
        />
    )
}

export default SpikeAmplitudesUnitView
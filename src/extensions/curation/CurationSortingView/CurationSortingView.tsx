import React, { FunctionComponent } from 'react'
import sizeMe, { SizeMeProps } from "react-sizeme"
import { defaultSortingCuration, SortingViewProps } from "../../extensionInterface"
import Splitter from '../../timeseries/TimeWidgetNew/Splitter'
import Units from '../../unitstable/Units/Units'
import ControlPanel from './ControlPanel'

interface OwnProps {
    height?: number
}

const CurationSortingView: FunctionComponent<SortingViewProps & SizeMeProps & OwnProps> = (props) => {
    const { sorting, selectedUnitIds, curationDispatch } = props
    const curation = sorting.curation || defaultSortingCuration

    if (!props.size.width) return <div>No width</div>

    const initialControlPanelWidth = 200
    const height = props.height !== undefined ? props.height : 800
    
    return (
        <Splitter
            width={props.size.width}
            height={height} // hard-coded for now
            initialPosition={initialControlPanelWidth}
        >
            <ControlPanel
                width={initialControlPanelWidth} // this will be overridden by the splitter
                curation={curation}
                curationDispatch={curationDispatch}
                selectedUnitIds={Object.keys(selectedUnitIds).filter(uid => (selectedUnitIds[uid])).map(uid => parseInt(uid))}
            />
            <Units
                {...props}
            />
        </Splitter>
    )
}

export default sizeMe()(CurationSortingView)
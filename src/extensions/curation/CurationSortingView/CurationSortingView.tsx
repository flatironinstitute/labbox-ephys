import React, { FunctionComponent } from 'react'
import sizeMe, { SizeMeProps } from "react-sizeme"
import { SortingViewProps } from "../../extensionInterface"
import Splitter from '../../timeseries/TimeWidgetNew/Splitter'
import ControlPanel from './ControlPanel'
import TabsView from './TabsView'

interface OwnProps {
    height?: number
}

const CurationSortingView: FunctionComponent<SortingViewProps & SizeMeProps & OwnProps> = (props) => {
    const { sorting, selection, selectionDispatch, curationDispatch } = props
    const curation = sorting.curation || {}

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
                selection={selection}
                selectionDispatch={selectionDispatch}
            />
            <TabsView
                {...props}
            />
        </Splitter>
    )
}

export default sizeMe()(CurationSortingView)
import React, { FunctionComponent } from 'react';
import { SortingViewPlugin, SortingViewProps } from '../../extensionInterface';
import { View } from './MountainView';

type Props = {
    view: View
    sortingViewProps: SortingViewProps
    width?: number
}

const ViewWidget: FunctionComponent<Props> = ({ view, sortingViewProps, width }) => {
    const p = view.plugin as SortingViewPlugin
    const Component = p.component
    let pr: {[key: string]: any} = {}
    if (width) pr.width = width
    return (
        <Component {...sortingViewProps} {...pr} />
    )
}

export default ViewWidget
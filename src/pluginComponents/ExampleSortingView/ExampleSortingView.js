import React from 'react'
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const ExampleSortingView = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    return (
        <div>This is an example sorting view.</div>
    );
}

const label = 'Example sorting view'

ExampleSortingView.sortingViewPlugin = {
    development: true,
    label: label
}

ExampleSortingView.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default ExampleSortingView
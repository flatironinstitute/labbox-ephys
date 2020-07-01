import React from 'react'
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const CrossCorrelograms = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    return (
        <div>Crosscorrelograms.</div>
    );
}

const label = 'Crosscorrelograms'

CrossCorrelograms.sortingViewPlugin = {
    label: label
}

CrossCorrelograms.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default CrossCorrelograms
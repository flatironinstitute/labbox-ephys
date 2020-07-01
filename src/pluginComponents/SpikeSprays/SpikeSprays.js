import React from 'react'
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const SpikeSprays = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    return (
        <div>Spike sprays.</div>
    );
}

const label = 'Spike sprays'

SpikeSprays.sortingViewPlugin = {
    label: label
}

SpikeSprays.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default SpikeSprays
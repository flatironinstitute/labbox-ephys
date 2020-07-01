import React from 'react'
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const SpikeAmplitudes = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    return (
        <div>Spike amplitudes over time.</div>
    );
}

const label = 'Spike amplitudes'

SpikeAmplitudes.sortingViewPlugin = {
    label: label
}

SpikeAmplitudes.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default SpikeAmplitudes;
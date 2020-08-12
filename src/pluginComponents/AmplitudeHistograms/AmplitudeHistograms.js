import React from 'react'
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const AmplitudeHistograms = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    return (
        <div>View amplitude histograms for units.</div>
    );
}

const label = 'Amplitude histograms'

AmplitudeHistograms.sortingViewPlugin = {
    development: true,
    label: label
}

AmplitudeHistograms.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default AmplitudeHistograms
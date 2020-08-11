import React from 'react'
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const Snippets = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    return (
        <div>View snippets (or clips) for a selected unit.</div>
    );
}

const label = 'Snippets'

Snippets.sortingViewPlugin = {
    development: true,
    label: label
}

Snippets.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default Snippets
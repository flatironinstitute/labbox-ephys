import React from 'react'
import RadioChoices from './RadioChoices';

const SelectSpikeSorter = ({ sorter, onSetSorter }) => {
    sorter = sorter || {};

    const algorithms = [
        'mountainsort4',
        'kilosort2'
    ];

    return (
        <RadioChoices
            label="Select spike sorter algorithm"
            value={sorter.algorithm || ''}
            onSetValue={(alg) => {
                onSetSorter({
                    ...sorter,
                    algorithm: alg
                })
            }}
            options={algorithms.map(s => ({label: s, value: s}))}
        />
    );
}

export default SelectSpikeSorter;
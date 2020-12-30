import { MenuItem, Select } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';

type FilterSelection = {
    filterType: 'none' | 'bandpass_filter'
}

type FilterSelectionAction = {
    type: 'SetFilterSelection',
    filterSelection: FilterSelection
}

export const filterSelectionReducer = (state: FilterSelection, action: FilterSelectionAction) => {
    if (action.type === 'SetFilterSelection') {
        return action.filterSelection
    }
    else {
        return state
    }
}

type Props = {
    filterSelection: FilterSelection
    filterSelectionDispatch: (a: FilterSelectionAction) => void
}

const FilterControl: FunctionComponent<Props & SizeMeProps> = ({ filterSelection, filterSelectionDispatch }) => {
    const choices: {filterSelection: FilterSelection, label: string}[] = [
        {
            filterSelection: {filterType: 'none'},
            label: 'No filter'
        },
        {
            filterSelection: {filterType: 'bandpass_filter'},
            label: 'Bandpass filter'
        }
    ]
    const handleChoice = useCallback((event: React.ChangeEvent<{value: any}>) => {
        const filterSelectionForValue = (val: string) => {
            return choices.filter(choice => (choice.filterSelection.filterType === val))[0].filterSelection
        }
        filterSelectionDispatch({type: 'SetFilterSelection', filterSelection: filterSelectionForValue(event.target.value)})
    }, [choices, filterSelectionDispatch])
    return (
        <Select
            value={filterSelection.filterType}
            onChange={handleChoice}
        >
            {
                choices.map(choice => (
                    <MenuItem key={choice.filterSelection.filterType} value={choice.filterSelection.filterType}>{choice.label}</MenuItem>
                ))
            }
        </Select>
    )
}

export default sizeMe()(FilterControl)
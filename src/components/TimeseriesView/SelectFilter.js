import React, { useState } from 'react'
import { makeStyles, FormControl, InputLabel, Select, MenuItem, Button } from '@material-ui/core';

const filterChoices = [
    {
        filterType: 'none'
    },
    {
        filterType: 'bandpass'
    }
]

const SelectFilter = ({filterPrefs, onFilterPrefsChanged}) => {
    const [internalFilterChoice, setInternalFilterChoice] = useState(filterPrefs);

    const handleFilterTypeChanged = (filterType) => {
        const a = filterChoices.filter(fc => (fc.filterType === filterType))[0];
        if (a) {
            setInternalFilterChoice(a);
        }
    }
    const handleUpdate = () => {
        onFilterPrefsChanged(internalFilterChoice)
    }
    const updateDisabled = (JSON.stringify(filterPrefs) === JSON.stringify(internalFilterChoice)) ? true : false;
    return (
        <div>
            <h3>Select filter</h3>
            <SelectString
                label={'Filter type'}
                options={filterChoices.map(fc => (fc.filterType))}
                value={internalFilterChoice.filterType}
                onChange={(filterType) => handleFilterTypeChanged(filterType)}
            />
            <Button onClick={() => handleUpdate()} disabled={updateDisabled}>Update</Button>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 240,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const SelectString = ({ value, onChange, disabled=false, options, label }) => {
    const classes = useStyles();

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="select-string-label">{label}&nbsp;</InputLabel>
            <Select
                labelId="select-string-label"
                id="select-string"
                disabled={disabled}
                value={value}
                onChange={evt => { onChange(evt.target.value) }}
            >
                {
                    options.map((x) => (
                        <MenuItem key={x} value={x}>{x}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}

export default SelectFilter;
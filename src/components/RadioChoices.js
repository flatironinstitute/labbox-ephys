import React from 'react'
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core'

const RadioChoices = ({ label, value, onSetValue, options }) => {
    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup value={value} onChange={(evt) => onSetValue(evt.target.value)}>
                {
                    options.map(opt => (
                        <FormControlLabel
                            key={opt.label}
                            value={opt.value}
                            control={<Radio />}
                            label={opt.label}
                            disabled={opt.disabled ? true : false}
                        />
                    ))
                }
            </RadioGroup>
        </FormControl>
    );
}

export default RadioChoices;
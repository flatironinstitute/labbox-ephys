import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles((theme) => ({
    checkIcon: {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }
    }
}))

const CreateTagChip = ({ handleSave, chipClass }) => {
    const classes = useStyles()
    const [name, setName] = useState('')

    const handleChange = (event) => {
        setName(event.target.value);
    };

    const handleKeyPress = (e) => {
        const { key } = e
        if (key.toLowerCase() === 'enter') {
            handleSave(name)
        }
    }

    return (
        <Chip
            variant="outlined"
            size='small'
            label={<TextField
                placeholder="Click to add tag"
                onChange={handleChange}
                InputProps={{
                    onKeyPress: handleKeyPress,
                    disableUnderline: true,
                    endAdornment:
                        < InputAdornment position="end" >
                            <IconButton
                                className={classes.checkIcon}
                                onClick={() => handleSave(name)}
                                edge="end"
                            >
                                <CheckIcon />
                            </IconButton>
                        </InputAdornment>
                }}
            />}
            className={chipClass}
        />
    )
}

export default CreateTagChip

import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'

const useStyles = makeStyles(() => ({
    size: {
        fontSize: 16
    }
}))

const TagsContainer = () => {
    const classes = useStyles();

    const handleDelete = () => {
        console.info('You clicked the delete icon.');
    };


    return (
        <Chip
            variant="outlined"
            size='small'
            classes={{ sizeSmall: classes.size }}
            onDelete={handleDelete}
            label='chip test'
        />
    )
}

export default TagsContainer

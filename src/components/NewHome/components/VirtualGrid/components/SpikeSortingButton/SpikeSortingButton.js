import React from 'react'
import { makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles((theme) => ({
    baseButton: {
        padding: '10px 18px',
        borderRadius: 6,
        backgroundColor: theme.palette.colors.lightBlue,
        color: theme.palette.colors.white,
        textTransform: 'none',
        '&:hover': {
            backgroundColor: theme.palette.colors.lightBlue1
        }
    }
}))



const SpikeSortingButton = ({ rowData }) => {
    const classes = useStyles()

    const hadleClick = () => {
        alert('sorting' + rowData.file)
    }

    return (
        <Button onClick={hadleClick} className={classes.baseButton}>Run Spikesorting</Button>
    )
}

export default SpikeSortingButton

import React from 'react'
import FiberManualRecordRoundedIcon from '@material-ui/icons/FiberManualRecordRounded';
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'inline-flex'
    },
    point: ({ selectedColor }) => ({
        marginRight: 5,
        fontSize: 16,
        marginTop: 2,
        color: selectedColor
            ? theme.palette.colors.grey2
            : theme.palette.colors.red,
    }),
    text: {
        fontSize: 14
    }
}))

const SampleRate = ({ label }) => {
    const selectedColor = label < 30000
    const classes = useStyles({ selectedColor })
    return (
        <div className={classes.container}>
            <FiberManualRecordRoundedIcon className={classes.point} />
            <Typography className={classes.text}>{label}</Typography>
        </div>
    )
}

export default SampleRate

import React from 'react'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import RecordingInfoPanel from '../RecordingInfoPanel'

const useStyles = makeStyles((theme) => ({
    noSorting: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        padding: 0,
        margin: 0,
        fontSize: 34
    }
}))


const RecordingBody = (props) => {
    const classes = useStyles()
    return (
        <Grid container direction='row'>
            <Grid item xs={3}>
                <RecordingInfoPanel {...props} />
            </Grid>
            <Grid item xs={1}>
                <Divider orientation='vertical' />
            </Grid>
            <Grid item xs={8}>
                <Typography className={classes.noSorting}>
                    No sorting available
                </Typography>
            </Grid>
        </Grid>
    )
}

export default RecordingBody

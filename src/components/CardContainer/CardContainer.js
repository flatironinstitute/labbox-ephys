import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import CardItem from './components/CardItem'

const useStyles = makeStyles(() => ({
    gridRoot: {
        paddingRight: 15,
        paddingBottom: 30
    }
}))

const CardContainer = ({ recording }) => {
    const classes = useStyles();
    const usedObj = {
        sampleRate: recording && recording.recordingObject
            ? recording.recordingObject.data.samplerate
            : '',
        duration: recording && recording.recordingObject
            ? recording.recordingObject.data.num_frames / recording.recordingObject.data.samplerate / 60
            : '',
        channel: recording && recording.recordingObject
            ? recording.recordingObject.data.raw_num_channels
            : ''
        // missing probe design
    }

    return (
        <Grid container spacing={2} className={classes.gridRoot}>
            <Grid item xs={6}>
                <CardItem title={'Sample Rate'} content={usedObj.sampleRate} />
            </Grid>
            <Grid item xs={6}>
                <CardItem title={'Duration (sec)'} content={usedObj.duration} />
            </Grid>
            <Grid item xs={6}>
                <CardItem title={'Channel Count'} content={usedObj.channel} />
            </Grid>
            <Grid item xs={6}>
                <CardItem title={'Probe Design'} content={''} />
            </Grid>
        </Grid>

    )
}

export default CardContainer

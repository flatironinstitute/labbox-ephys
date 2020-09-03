import React from 'react'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import RecordingInfoPanel from '../RecordingInfoPanel'

const RecordingBody = (props) => {
    return (
        <Grid container direction='row'>
            <Grid item xs={3}>
                <RecordingInfoPanel {...props} />
            </Grid>
            <Grid item xs={1}>
                <Divider orientation='vertical' />
            </Grid>
            <Grid item xs={8}>
                <Typography>no sorting</Typography>
            </Grid>
        </Grid>
    )
}

export default RecordingBody

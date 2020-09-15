import React from 'react'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import RecordingInfoPanel from '../RecordingInfoPanel'
import SortingsView from '../SortingsView'

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
    },
    panel: {
        borderRight: `1px solid ${theme.palette.colors.grey3}`
    }
}))


const RecordingBody = (props) => {
    const classes = useStyles()
    const { sortings, sortingJobs } = props
    const showSorting =
        sortings &&
        sortingJobs &&
        (sortings.length > 0 || sortingJobs.length > 0)
    return (
        <Grid container direction='row'>
            <Grid item xs={4} className={classes.panel}>
                <RecordingInfoPanel {...props} />
            </Grid>
            <Grid item xs={8}>
                {showSorting
                    ? (
                        <SortingsView  {...props} />
                    ) : (
                        < Typography className={classes.noSorting}>
                            No sorting available
                        </Typography>
                    )}
            </Grid>
        </Grid >
    )
}

export default RecordingBody

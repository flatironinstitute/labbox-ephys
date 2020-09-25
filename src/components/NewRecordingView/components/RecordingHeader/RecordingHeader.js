import React from 'react'
import { Link } from 'react-router-dom';
import { Typography, Button, Grid } from '@material-ui/core'
import { getPathQuery } from '../../../../kachery';
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    titleId: {
        fontSize: 24,
        color: theme.palette.type === 'dark'
            ? theme.palette.colors.white
            : theme.palette.colors.lightBlue
    },
    button: {
        padding: '5px 20px',
        marginRight: theme.spacing(3),
        backgroundColor: theme.palette.colors.lightBlue,
        color: theme.palette.colors.white,
        textTransform: 'none',
        borderRadius: 6,
        boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.14), 0px 1px 8px rgba(0, 0, 0, 0.2)',
        '&:hover': {
            backgroundColor: theme.palette.colors.lightBlue1
        }
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 600,
    },
    date: {
        fontSize: 14,
        color: theme.palette.type === 'dark'
            ? theme.palette.colors.white
            : theme.palette.colors.grey2
    }
}))

const RecordingHeader = (props) => {
    const { recordingId, recordingUpdateDate, documentId, feedUri } = props
    const classes = useStyles()
    return (
        <>
            <Grid container justify="space-between" alignItems="center" wrap="nowrap" >
                <Typography noWrap className={classes.titleId}>RecordingID: {recordingId}</Typography>
                <div style={{ flexGrow: 1 }} />
                <Button variant='contained' className={classes.button}>
                    <Typography noWrap>
                        View Time Series
                    </Typography>
                </Button>

                <Button variant='contained' className={classes.button}>
                    <Typography noWrap>
                        Run Spikesorting
                    </Typography>
                </Button>
                <Button variant='contained' className={classes.button}>
                    <Typography noWrap>
                        Import Sorting
                    </Typography>
                </Button>
                <Button variant='contained' className={classes.button}>
                    <Typography noWrap>
                        Download Row Data
                    </Typography>
                </Button>

            </Grid>
            <Typography className={classes.date}>{`Acquisition date: ${recordingUpdateDate}`}</Typography>
        </>
    )
}

export default RecordingHeader

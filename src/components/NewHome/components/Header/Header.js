import React from 'react'
import { Grid, Typography, Button } from '@material-ui/core'
import { Link } from 'react-router-dom';
import { getPathQuery } from '../../../../kachery';
import { makeStyles } from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const useStyles = makeStyles((theme) => ({
    titlecontainer: {
        flexGrow: 1
    },
    title: {
        fontSize: 20,
        fontWeight: 600
    },
    viewOnly: {
        fontStyle: "italic"
    },
    lightButton: {
        color: 'rgba(12, 180, 206, 1)',
        backgroundColor: 'rgba(12, 180, 206, 0.05)',
        padding: '10px 18px',
        borderRadius: 6,
        '&:hover': {
            backgroundColor: 'rgba(12, 180, 206, 0.3)'
        }
    },
    darkButton: {

    }
}))


const Header = ({ documentInfo }) => {
    const { documentId, feedUri, readonly } = documentInfo;
    const classes = useStyles()

    return (
        <Grid container >
            {readonly && <Grid item xs={12}>
                <Typography className={classes.viewOnly}>
                    VIEW ONLY
                </Typography>
            </Grid>}
            <Grid item className={classes.titlecontainer}>
                <Typography className={classes.title}> Analysis and visualization of neurophysiology recordings and spike sorting results. </Typography>
            </Grid>
            <Grid item >
                {!readonly &&
                    <Button
                        startIcon={<CloudUploadIcon />}
                        className={classes.lightButton}
                        component={Link}
                        to={`/${documentId}/importRecordings${getPathQuery({ feedUri })}`}>
                        Import recordings
                    </Button>
                }
            </Grid>
        </Grid >
    )
}
export default Header

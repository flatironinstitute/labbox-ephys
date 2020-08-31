import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom';
import { getPathQuery } from '../../../../kachery';
import { makeStyles, useTheme } from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import cn from 'classnames'

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
    baseButton: {
        padding: '10px 18px',
        borderRadius: 6,
        '&:hover': {
            backgroundColor: theme.palette.colors.lightBlue1
        }
    },
    lightButton: {
        color: theme.palette.colors.lightBlue,
        backgroundColor: theme.palette.colors.lightBlue2,
    },
    darkButton: {
        backgroundColor: theme.palette.colors.lightBlue,
    }
}))


const Header = ({ documentInfo }) => {
    const { documentId, feedUri, readonly } = documentInfo;
    const classes = useStyles()
    const theme = useTheme()
    const showDark = theme.palette.type === 'dark'

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
                        className={showDark
                            ? cn(classes.baseButton, classes.darkButton)
                            : cn(classes.baseButton, classes.lightButton)
                        }
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

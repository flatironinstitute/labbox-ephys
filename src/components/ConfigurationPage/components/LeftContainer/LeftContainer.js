import React from 'react'
import { makeStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import SharingConfiguration from '../SharingConfiguration/SharingConfiguration'
import ExtensionConfiguration from '../ExtensionConfiguration/ExtensionConfiguration'

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: 34
    },
    border: {
        borderBottom: `1px solid ${theme.palette.colors.grey3}`,
        paddingBottom: '50px !important',
        marginBottom: 50
    },
    subtitle: {
        fontSize: 28,
        marginBottom: 24
    },
    primary: {
        color: theme.palette.colors.mainColor
    }
}))


const LeftContainer = ({
    documentInfo,
    defaultFeedId,
    nodeId,
    extensionsConfig,
    onSetExtensionEnabled
}) => {
    const classes = useStyles()
    return (
        <Grid container direction='column' wrap='nowrap'>
            <Grid item>
                <Typography className={classes.title}>
                    Configuration
                </Typography>
            </Grid>
            <Grid item className={classes.border}>
                <SharingConfiguration
                    documentInfo={documentInfo}
                    defaultFeedId={defaultFeedId}
                />
            </Grid>
            <Grid item className={classes.border}>
                <Typography className={classes.subtitle}>
                    Compute resource configuration
                </Typography>
                <Typography>
                    kachery-p2p node ID: <span className={classes.primary}>{nodeId}</span>
                </Typography>
            </Grid>
            <Grid item >
                <ExtensionConfiguration
                    extensionsConfig={extensionsConfig}
                    onSetExtensionEnabled={onSetExtensionEnabled}
                />
            </Grid>
        </Grid >
    )
}

export default LeftContainer

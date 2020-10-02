import React from 'react'
import { makeStyles } from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles((theme) => ({
    subtitle: {
        fontSize: 28,
        marginBottom: 24
    },
    form: {
        justifyContent: 'flex-end',
        margin: 0,
        width: 'max-content'
    },
    label: {
        minWidth: 200
    },
    switchBase: {
        // color: purple[300],
        '&$checked': {
            color: theme.palette.colors.mainColor,
        },
        '&$checked + $track': {
            backgroundColor: theme.palette.colors.mainColor,
        },
    },
    checked: {},
    track: {},
}))



const ExtensionConfiguration = ({ extensionsConfig, onSetExtensionEnabled }) => {
    const classes = useStyles()

    const handleChange = (event) => {
        onSetExtensionEnabled(event.target.name, event.target.checked)
    };

    return (
        <Grid container direction='column'>
            <Typography className={classes.subtitle}>Extensions</Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={extensionsConfig.enabled.development}
                        onChange={handleChange}
                        name="development"
                        classes={{
                            switchBase: classes.switchBase,
                            track: classes.track,
                            checked: classes.checked,
                        }}
                    />
                }
                labelPlacement="start"
                label="Development"
                className={classes.form}
                classes={{
                    label: classes.label
                }}
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={extensionsConfig.enabled.frankLabDataJoint}
                        onChange={handleChange}
                        name="frankLabDataJoint"
                        classes={{
                            switchBase: classes.switchBase,
                            track: classes.track,
                            checked: classes.checked,
                        }}
                    />
                }
                labelPlacement="start"
                label="FrankLab DataJoint"
                className={classes.form}
                classes={{
                    label: classes.label
                }}
            />
        </Grid>
    )
}

export default ExtensionConfiguration

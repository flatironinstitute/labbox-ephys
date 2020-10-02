import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { setFrankLabDataJointConfig } from '../../../../extensions/frankLabDataJoint/actions'
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField'
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '100%',
        height: '100%',
        padding: 50
    },
    input: {
        '&::placeholder': {
            color: theme.palette.colors.grey,
            fontSize: 14
        }
    },
    title: {
        fontWeight: 500,
        fontSize: 24,
        paddingBottom: 50
    },
    field: {
        paddingBottom: 36
    },
    button: {
        backgroundColor: theme.palette.colors.mainColor,
        display: 'flex',
        color: theme.palette.colors.white,
        padding: '10px 100px',
        bottom: 30,
        borderRadius: 6,
        margin: 'auto',
        marginRight: 0
    }
}));


const RightContainer = ({
    frankLabDataJointConfig,
    onSetFrankLabDataJointConfig
}) => {
    const initialState = {
        port: frankLabDataJointConfig.port ? frankLabDataJointConfig.port : '',
        user: frankLabDataJointConfig.user ? frankLabDataJointConfig.user : '',
        password: frankLabDataJointConfig.password ? frankLabDataJointConfig.password : '',
    }
    const classes = useStyles();
    const [state, setState] = useState(initialState)
    const { port, user, password } = state

    const isValidPort = () => {
        if (!port) return true;
        return Number(port) + '' === port + '';
    }
    const handleChange = (event) => {
        event.persist()
        if (event && event.target) {
            setState(curr => ({
                ...curr,
                [event.target.name]: event.target.value || ''
            }));
        }
    };

    const handleSubmit = () => {
        onSetFrankLabDataJointConfig({
            port: Number(port),
            user,
            password
        })
    }

    const somethingChanged = (
        (port !== '') ||
        (user !== '') ||
        (password !== '')
    )

    const helperText = isValidPort() ? 'Invalid Port.' : ''
    return (
        <Paper className={classes.paper}>
            <div style={{ flexGrow: 1, height: '100%' }}>
                <Typography className={classes.title}>
                    FrankLab DataJoint
                </Typography>
                <TextField
                    name='port'
                    error={isValidPort()}
                    helperText={helperText}
                    label='Port'
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    className={classes.field}
                    InputProps={{
                        classes: {
                            input: classes.input
                        }
                    }}
                />
                <TextField
                    name='user'
                    label='User'
                    variant="outlined"
                    onChange={handleChange}
                    fullWidth
                    className={classes.field}
                    InputProps={{
                        classes: {
                            input: classes.input
                        }
                    }}
                />
                <TextField
                    name='password'
                    label='Password'
                    type="password"
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    className={classes.field}
                    InputProps={{
                        classes: {
                            input: classes.input
                        }
                    }}
                />
            </div>
            <Button
                variant='contained'
                disabled={!somethingChanged && !isValidPort()}
                onClick={handleSubmit}
                className={classes.button}
            >
                Submit
            </Button>
        </Paper>
    )
}

const mapStateToProps = state => ({
    frankLabDataJointConfig: state.extensionsConfig.frankLabDataJoint
})

const mapDispatchToProps = dispatch => ({
    onSetFrankLabDataJointConfig: config => dispatch(setFrankLabDataJointConfig(config))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RightContainer)
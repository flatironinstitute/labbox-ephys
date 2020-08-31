import React from 'react'
import { connect } from 'react-redux';
import { setDarkMode } from '../../actions';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import Checkbox from '@material-ui/core/Checkbox';
import { AppBarLogo } from '../Icons';
import { Link } from 'react-router-dom';
import { getPathQuery } from '../../kachery';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%'
    },
    app: {
        backgroundColor: theme.palette.main.primary
    },
    grow: {
        flexGrow: 1
    },
    button: {
        fontWeight: 600,
        color: theme.palette.colors.white,
        textTransform: 'none',
        size: 14,
        padding: theme.spacing(3),
    },
    divider: {
        borderRight: 'white !important'
    },
    icon: {
        color: theme.palette.colors.white
    }
}));

const RootAppBar = ({ documentInfo, extensionsConfig, onSetDarkMode, darkMode }) => {
    const classes = useStyles();
    const { documentId, feedUri } = documentInfo;

    const handleDarkMode = () => {
        onSetDarkMode(!darkMode.status)
    }

    return (
        <div className={classes.root}>
            <AppBar position="absolute" className={classes.app}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" component={Link} to={`/${documentId}${getPathQuery({ feedUri })}`} >
                        <AppBarLogo />
                    </IconButton>
                    <div className={classes.grow} />
                    <ButtonGroup variant="text" classes={{ groupedHorizontal: classes.divider }}>
                        {/* Need link for this button*/}
                        <Button className={classes.button}>Database</Button>

                        <Button className={classes.button} component={Link} to={`/${documentId}/config${getPathQuery({ feedUri })}`}>Configuration</Button>

                        {/* Need link for this button*/}
                        <Button className={classes.button}>Support</Button>

                        {extensionsConfig.enabled.development && <Button className={classes.button} component={Link} to="/prototypes">Prototypes</Button>}
                        <Checkbox
                            checked={darkMode.status}
                            onClick={handleDarkMode}
                            disableRipple
                            icon={<Brightness4Icon className={classes.icon} />}
                            checkedIcon={<Brightness7Icon className={classes.icon} />}
                        />

                        {/* Need link for this button*/}
                        <IconButton><PersonIcon className={classes.icon} /></IconButton>
                    </ButtonGroup>
                </Toolbar>
            </AppBar>
        </div>
    )
}

const mapStateToProps = state => ({
    darkMode: state.darkMode
})

const mapDispatchToProps = dispatch => ({
    onSetDarkMode: (value) => dispatch(setDarkMode(value))
})


export default connect(mapStateToProps, mapDispatchToProps)(RootAppBar)

//used only to keep track of links and icons used previously, until we have the final version

/* const ToolBarContent = ({ documentInfo, extensionsConfig }) => {
    const { documentId, feedUri, readonly } = documentInfo;
    return (
        <Fragment>
            <Button color="inherit" component={Link} to={`/${documentId}${getPathQuery({ feedUri })}`}>
                <Home />&nbsp;
                <Typography variant="h6">
                    Labbox-ephys
                </Typography>
            </Button>
            <span style={{ marginLeft: 'auto' }} />
            <Button color="inherit" component={Link} to={`/${documentId}/config${getPathQuery({ feedUri })}`} style={{ marginLeft: 'auto' }}>Config</Button>
            {
                extensionsConfig.enabled.development && <Button color="inherit" component={Link} to="/prototypes">Prototypes</Button>
            }
            <Button color="inherit" component={Link} to="/about">About</Button>
            <PersistStateControl />
            <HitherJobMonitorControl />
        </Fragment>
    )
} */

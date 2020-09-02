import React from 'react'
import { connect } from 'react-redux';
import { setDarkMode } from '../../actions';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid'
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
    appbarToolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    appbarActionsContainer: {
        paddingLeft: 20
    },
    button: {
        fontWeight: 600,
        color: theme.palette.colors.white,
        textTransform: 'none',
        size: 14,
        padding: theme.spacing(3),
        textDecoration: 'none'
    },
    icon: {
        color: theme.palette.colors.white
    }
}));

const RootAppBar = ({ documentInfo, extensionsConfig, onSetDarkMode, darkMode }) => {
    const classes = useStyles();
    const { documentId, feedUri } = documentInfo;

    const handleDarkMode = () => onSetDarkMode(!darkMode.status)

    const pathQuery = getPathQuery({ feedUri })

    return (
        <div className={classes.root}>
            <AppBar position="absolute" className={classes.app}>
                <Toolbar className={classes.appbarToolbar}>
                    <Link to={`/${documentId}${pathQuery}`} >
                        <AppBarLogo />
                    </Link>
                    <Grid container alignItems="center" justify="flex-end">
                        <Grid item>
                            <Link className={classes.button}>Database</Link>
                            <Link className={classes.button} to={`/${documentId}/config${pathQuery}`}>Configuration</Link>
                            <Link className={classes.button}>Support</Link>
                            {extensionsConfig.enabled.development && <Link className={classes.button} to="/prototypes">Prototypes</Link>}

                        </Grid>
                        <Grid item className={classes.appbarActionsContainer}>
                            <Checkbox
                                checked={darkMode.status}
                                onClick={handleDarkMode}
                                disableRipple
                                icon={<Brightness4Icon className={classes.icon} />}
                                checkedIcon={<Brightness7Icon className={classes.icon} />}
                            />

                            <IconButton><PersonIcon className={classes.icon} /></IconButton></Grid>
                    </Grid>
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

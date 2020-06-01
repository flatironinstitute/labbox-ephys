import React, { Fragment } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { Home } from '@material-ui/icons';
import PersistStateControl from './containers/PersistStateControl';
import HitherJobMonitorControl from './containers/HitherJobMonitorControl';
import { connect } from 'react-redux';
const ToolBarContent = () => {
    return (
        <Fragment>
            <Button color="inherit" component={Link} to="/">
                <Home />&nbsp;
                <Typography variant="h6">
                    Labbox-ephys
                </Typography>
            </Button>
            <span style={{marginLeft: 'auto'}} />
            <Button color="inherit" component={Link} to="/config" style={{marginLeft: 'auto'}}>Config</Button>
            <Button color="inherit" component={Link} to="/prototypes">Prototypes</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            <PersistStateControl />
            <HitherJobMonitorControl />
        </Fragment>
    )
}
//////////////////////////////////////////////////////////////

const AppContainer = ({ initialLoad, children }) => {
    let loaded = true;
    ['recordings', 'sortings', 'sortingJobs', 'jobHandlers'].forEach(
        key => {
            if (!initialLoad[key])
                loaded = false;
        }
    )
    return (
        <div className={"TheAppBar"}>
            <AppBar position="static">
                <Toolbar>
                    <ToolBarContent />
                </Toolbar>
            </AppBar>
            <div style={{padding: 30}}>
                {
                    loaded ? (
                        children
                    ) : (
                        <div>Loading...</div>
                    )
                }
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        initialLoad: state.initialLoad
    }
}

const mapDispatchToProps = dispatch => ({
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer)
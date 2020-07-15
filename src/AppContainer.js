import React, { Fragment, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { setDocumentId, setFeedId } from './actions';

// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { Home } from '@material-ui/icons';
import PersistStateControl from './containers/PersistStateControl';
import HitherJobMonitorControl from './containers/HitherJobMonitorControl';
import { connect } from 'react-redux';
import { getFeedId } from './kachery';
const ToolBarContent = ({ feedId, documentId }) => {
    return (
        <Fragment>
            <Button color="inherit" component={Link} to={`/f/${feedId}/d/${documentId}`}>
                <Home />&nbsp;
                <Typography variant="h6">
                    Labbox-ephys
                </Typography>
            </Button>
            <span style={{marginLeft: 'auto'}} />
            <Button color="inherit" component={Link} to={`/f/${feedId}/d/${documentId}/config`} style={{marginLeft: 'auto'}}>Config</Button>
            <Button color="inherit" component={Link} to="/prototypes">Prototypes</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            <PersistStateControl />
            <HitherJobMonitorControl />
        </Fragment>
    )
}
//////////////////////////////////////////////////////////////

const SetDocumentId = ({ documentId, onSetDocumentId, feedId, onSetFeedId }) => {
    useEffect(() => {
        (async () => {
            onSetDocumentId(documentId);
            if ((!feedId) || (feedId === 'default')) {
                feedId = await getFeedId('labbox-ephys-default');
            }
            onSetFeedId(feedId);
        })();
    })
    return <div>Setting document id...</div>
}

const AppContainer = ({ location, initialLoad, children, documentId, onSetDocumentId, feedId, onSetFeedId }) => {
    let loaded = true;
    ['recordings', 'sortings', 'sortingJobs', 'jobHandlers'].forEach(
        key => {
            if (!initialLoad[key])
                loaded = false;
        }
    )

    if (!documentId) {
        return (
            <Switch>
                <Route
                    path="/f/:feedId/d/:documentId/:path*"
                    render={({ match }) => {
                        return <SetDocumentId
                            documentId={match.params.documentId}
                            onSetDocumentId={onSetDocumentId}
                            feedId={match.params.feedId}
                            onSetFeedId={onSetFeedId}
                        />
                    }}
                />
                <Route path="/"><Redirect to="/f/default/d/default" /></Route>
            </Switch>
        )
    }

    return (
        <div className={"TheAppBar"}>
            <AppBar position="static">
                <Toolbar>
                    <ToolBarContent documentId={documentId} feedId={feedId} />
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
        initialLoad: state.initialLoad,
        documentId: state.documentInfo.documentId,
        feedId: state.documentInfo.feedId
    }
}

const mapDispatchToProps = dispatch => ({
    onSetDocumentId: documentId => dispatch(setDocumentId(documentId)),
    onSetFeedId: feedId => dispatch(setFeedId(feedId))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer))
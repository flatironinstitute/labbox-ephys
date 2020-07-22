import React, { Fragment, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { setDocumentId, setFeedUri } from './actions';
import * as QueryString from "query-string";

// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { Home } from '@material-ui/icons';
import PersistStateControl from './containers/PersistStateControl';
import HitherJobMonitorControl from './containers/HitherJobMonitorControl';
import { connect } from 'react-redux';
import { getPathQuery } from './kachery';

const ToolBarContent = ({ feedUri, documentId }) => {
    return (
        <Fragment>
            <Button color="inherit" component={Link} to={`/${documentId}${getPathQuery({feedUri})}`}>
                <Home />&nbsp;
                <Typography variant="h6">
                    Labbox-ephys
                </Typography>
            </Button>
            <span style={{marginLeft: 'auto'}} />
            <Button color="inherit" component={Link} to={`/${documentId}/config${getPathQuery({feedUri})}`} style={{marginLeft: 'auto'}}>Config</Button>
            <Button color="inherit" component={Link} to="/prototypes">Prototypes</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            <PersistStateControl />
            <HitherJobMonitorControl />
        </Fragment>
    )
}
//////////////////////////////////////////////////////////////

const SetDocumentId = ({ documentId, onSetDocumentId, feedUri, onSetFeedUri }) => {
    useEffect(() => {
        (async () => {
            onSetDocumentId(documentId);
            if ((!feedUri) || (feedUri === 'default')) {
                // const id0 = await getFeedId('labbox-ephys-default');
                //
                feedUri = 'default';
            }
            console.info(`Using feed: ${feedUri}`);
            onSetFeedUri(feedUri);
        })();
    })
    return <div>Setting document id...</div>
}

const AppContainer = ({ location, initialLoad, children, documentId, onSetDocumentId, feedUri, onSetFeedUri }) => {
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
                    path="/:documentId/:path*"
                    render={({ match, location }) => {
                        const query = QueryString.parse(location.search);
                        return <SetDocumentId
                            documentId={match.params.documentId}
                            onSetDocumentId={onSetDocumentId}
                            feedUri={query.feed || 'default'}
                            onSetFeedUri={onSetFeedUri}
                        />
                    }}
                />
                <Route path="/"><Redirect to="/default" /></Route>
            </Switch>
        )
    }

    return (
        <div className={"TheAppBar"}>
            <AppBar position="static">
                <Toolbar>
                    <ToolBarContent documentId={documentId} feedUri={feedUri} />
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
        feedUri: state.documentInfo.feedUri
    }
}

const mapDispatchToProps = dispatch => ({
    onSetDocumentId: documentId => dispatch(setDocumentId(documentId)),
    onSetFeedUri: feedUri => dispatch(setFeedUri(feedUri))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer))
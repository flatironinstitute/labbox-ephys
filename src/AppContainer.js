import React, { Fragment, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { setDocumentInfo } from './actions';
import * as QueryString from "query-string";

// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { Home } from '@material-ui/icons';
import PersistStateControl from './containers/PersistStateControl';
import HitherJobMonitorControl from './containers/HitherJobMonitorControl';
import { connect } from 'react-redux';
import { getPathQuery, getFeedId } from './kachery';

const ToolBarContent = ({ documentInfo }) => {
    const { documentId, feedUri, readonly } = documentInfo;
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

const SetDocumentInfo = ({ documentId, feedUri, onSetDocumentInfo }) => {
    useEffect(() => {
        (async () => {
            let resolvedFeedUri = feedUri;
            if ((!feedUri) || (feedUri === 'default')) {
                const feedId = await getFeedId('labbox-ephys-default');
                feedUri = 'default';
                resolvedFeedUri = `feed://${feedId}`;
            }
            console.info(`Using feed: ${feedUri} ${resolvedFeedUri}`);
            const readonly = resolvedFeedUri ? resolvedFeedUri.startsWith('sha1://') : false;
            onSetDocumentInfo({
                documentId,
                feedUri,
                resolvedFeedUri,
                readonly
            });
        })();
    })
    return <div>Setting document id...</div>
}

const AppContainer = ({ location, initialLoad, children, documentInfo, onSetDocumentInfo }) => {
    const { documentId, feedId } = documentInfo;
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
                        return <SetDocumentInfo
                            documentId={match.params.documentId}
                            feedUri={query.feed || 'default'}
                            onSetDocumentInfo={onSetDocumentInfo}
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
                    <ToolBarContent documentInfo={documentInfo} />
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
        documentInfo: state.documentInfo
    }
}

const mapDispatchToProps = dispatch => ({
    onSetDocumentInfo: documentInfo => dispatch(setDocumentInfo(documentInfo))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer))
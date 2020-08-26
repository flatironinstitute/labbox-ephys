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
import { getPathQuery } from './kachery';

const ToolBarContent = ({ documentInfo, extensionsConfig }) => {
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
            {
                extensionsConfig.enabled.development && <Button color="inherit" component={Link} to="/prototypes">Prototypes</Button>
            }
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
            console.info(`Using feed: ${feedUri}`);
            const readonly = ((feedUri) && (feedUri.startsWith('sha1://'))) ? true : false;
            onSetDocumentInfo({
                documentId,
                feedUri,
                readonly
            });
        })();
    })
    return <div>Setting document info...</div>
}

const AppContainer = ({ location, initialLoadComplete, children, documentInfo, onSetDocumentInfo, extensionsConfig }) => {
    const { documentId, feedUri, readonly } = documentInfo;

    if (!documentId) {
        return (
            <Switch>
                <Route
                    path="/:documentId/:path*"
                    render={({ match, location }) => {
                        const query = QueryString.parse(location.search);
                        return <SetDocumentInfo
                            documentId={match.params.documentId}
                            feedUri={query.feed || null}
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
                    <ToolBarContent documentInfo={documentInfo} extensionsConfig={extensionsConfig} />
                </Toolbar>
            </AppBar>
            <div style={{padding: 30}}>
                {
                    initialLoadComplete ? (
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
        initialLoadComplete: state.serverConnection.initialLoadComplete,
        documentInfo: state.documentInfo,
        extensionsConfig: state.extensionsConfig
    }
}

const mapDispatchToProps = dispatch => ({
    onSetDocumentInfo: documentInfo => dispatch(setDocumentInfo(documentInfo))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer))
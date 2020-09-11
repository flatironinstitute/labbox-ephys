import React, { useEffect } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { setDocumentInfo } from './actions';
import * as QueryString from "query-string";
import { MAIN_APPBAR_HEIGHT } from './utils/styles'

// LABBOX-CUSTOM /////////////////////////////////////////////
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import RootAppBar from './components/RootAppBar';

const useStyles = makeStyles(() => ({
    container: {
        padding: '60px 20px',
        height: `calc(100vh - ${MAIN_APPBAR_HEIGHT}px)`,
    }
}));


const SetDocumentInfo = ({ documentId, feedUri, onSetDocumentInfo }) => {
    useEffect(() => {
        (async () => {
            console.info(`Using feed: ${feedUri}`);
            const readOnly = ((feedUri) && (feedUri.startsWith('sha1://'))) ? true : false;
            onSetDocumentInfo({
                documentId,
                feedUri,
                readOnly
            });
        })();
    })
    return <div>Setting document info...</div>
}

const AppContainer = ({ location, initialLoadComplete, children, documentInfo, onSetDocumentInfo, extensionsConfig, currentUser }) => {
    const { documentId } = documentInfo;
    const classes = useStyles();

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
            <RootAppBar documentInfo={documentInfo} extensionsConfig={extensionsConfig} />
            <div className={classes.container}>
                {initialLoadComplete ? (children) : (<div className={classes.container}>Loading...</div>)}
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        initialLoadComplete: state.serverConnection.initialLoadComplete,
        documentInfo: state.documentInfo,
        extensionsConfig: state.extensionsConfig,
        currentUser: state.login.currentUser

    }
}

const mapDispatchToProps = dispatch => ({
    onSetDocumentInfo: documentInfo => dispatch(setDocumentInfo(documentInfo))
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer))
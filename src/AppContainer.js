import React, { useEffect } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { setDocumentInfo } from './actions';
import * as QueryString from "query-string";

// LABBOX-CUSTOM /////////////////////////////////////////////
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import RootAppBar from './components/RootAppBar';

const useStyles = makeStyles(() => ({
    container: {
        padding: '60px 20px'
    }
}));


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
                {!initialLoadComplete ? (children) : (<div className={classes.container}>Loading...</div>)}
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
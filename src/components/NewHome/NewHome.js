import React from 'react';
import { makeStyles } from '@material-ui/core'
//import RecordingsTable from '../../containers/RecordingsTable';
import { connect } from 'react-redux';
import Header from './components/Header'
import Grid from '@material-ui/core/Grid'
import VirtualGrid from './components/VirtualGrid';
import * as QueryString from "query-string";
import { Switch, Route, Redirect } from 'react-router-dom';
import { setDocumentInfo } from '../../actions';
import FullScreenLoader from '../FullScreenLoader';

const useStyles = makeStyles((theme) => ({
    container: {
        margin: '20px 10px'
    },
    gridContainer: {
        padding: '20px 20px'
    }
}))

const SetDocumentInfo = ({ documentId, feedUri, onSetDocumentInfo }) => {
    React.useEffect(() => {
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

const NewHome = ({ documentInfo, initialLoadComplete, onSetDocumentInfo }) => {
    const { documentId } = documentInfo;
    const classes = useStyles()
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


    if (!initialLoadComplete) {
        return <FullScreenLoader />
    }

    return (
        <Grid container alignItems="stretch" className={classes.container}>
            <Grid item xs={12}>
                <Header documentInfo={documentInfo} />
            </Grid>
            <Grid item xs={12} className={classes.gridContainer} >
                <VirtualGrid />
            </Grid>
        </Grid>
    );
}

const mapStateToProps = state => ({
    initialLoadComplete: state.serverConnection.initialLoadComplete,
    documentInfo: state.documentInfo,
})

const mapDispatchToProps = dispatch => ({
    onSetDocumentInfo: documentInfo => dispatch(setDocumentInfo(documentInfo))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewHome)

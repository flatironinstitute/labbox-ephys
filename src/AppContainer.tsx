import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import { Home } from '@material-ui/icons';
import QueryString from 'querystring';
import React, { Dispatch, Fragment, FunctionComponent, useEffect, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link, Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import sizeMe from 'react-sizeme';
import { setDocumentInfo } from './actions';
import HitherJobMonitorControl from './components/HitherJobMonitor/HitherJobMonitorControl';
import PersistStateControl from './containers/PersistStateControl';
import { HitherJob } from './extensions/common/hither';
import { ExtensionsConfig } from './extensions/reducers';
import { getPathQuery } from './kachery';
import { RootAction, RootState } from './reducers';
import { DocumentInfo } from './reducers/documentInfo';
import Routes from './Routes';


type ToolBarContentProps = {
    documentInfo: DocumentInfo
    extensionsConfig: ExtensionsConfig
    websocketStatus: string
}

const ToolBarContent: FunctionComponent<ToolBarContentProps> = ({ documentInfo, extensionsConfig, websocketStatus }) => {
    const { documentId, feedUri } = documentInfo;
    const hitherJobs: HitherJob[] = []
    return (
        <Fragment>
            <Button color="inherit" component={Link} to={`/${documentId}${getPathQuery({feedUri})}`}>
                <Home />&nbsp;
                <Typography variant="h6">
                    Labbox-ephys
                </Typography>
            </Button>
            <span style={{marginLeft: 'auto'}} />
            <Button color="inherit" component={Link} to="/docs" style={{marginLeft: 'auto'}}>Docs</Button>
            <Button color="inherit" component={Link} to={`/${documentId}/config${getPathQuery({feedUri})}`} >Config</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            <PersistStateControl />
            <HitherJobMonitorControl
                {...{documentInfo, hitherJobs, websocketStatus}}
            />
        </Fragment>
    )
}
//////////////////////////////////////////////////////////////

const SetDocumentInfo: FunctionComponent<{documentId: string | null, feedUri: string | null, onSetDocumentInfo: (di: DocumentInfo) => void}> = ({ documentId, feedUri, onSetDocumentInfo }) => {
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

// Thanks: https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
//////////////////////////////////////////////////////////////////////////////////////////////////

interface StateProps {
    initialLoadComplete: boolean
    extensionsConfig: ExtensionsConfig
    documentInfo: DocumentInfo
    websocketStatus: string
}

interface DispatchProps {
    onSetDocumentInfo: (documentInfo: DocumentInfo) => void
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const AppContainer: FunctionComponent<Props> = ({ initialLoadComplete, documentInfo, onSetDocumentInfo, extensionsConfig, websocketStatus }) => {
    const { documentId } = documentInfo;

    const { width, height } = useWindowDimensions()

    if (!documentId) {
        return (
            <Switch>
                <Route
                    path="/:documentId/:path*"
                    render={({ match, location }) => {
                        const query = QueryString.parse(location.search);
                        return <SetDocumentInfo
                            documentId={match.params.documentId}
                            feedUri={(query.feed as string) || null}
                            onSetDocumentInfo={onSetDocumentInfo}
                        />
                    }}
                />
                <Route path="/"><Redirect to="/default" /></Route>
            </Switch>
        )
        
    }

    const toolBarHeight = 70
    const H = height - toolBarHeight - 5
    const hMargin = 30
    const W = width - hMargin * 2

    return (
        <div className={"TheAppBar"}>
            <AppBar position="static">
                <Toolbar>
                    <ToolBarContent documentInfo={documentInfo} extensionsConfig={extensionsConfig} websocketStatus={websocketStatus} />
                </Toolbar>
            </AppBar>
            <div className={"AppContent"} style={{padding: 0, position: 'absolute', top: toolBarHeight, height: H, left: hMargin, width: W, overflowY: 'auto', overflowX: 'hidden'}}>
                {
                    initialLoadComplete ? (
                        <Routes width={W} height={H} />
                    ) : (
                        <div>Loading...</div>
                    )
                }
            </div>
        </div>
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    initialLoadComplete: state.serverConnection.initialLoadComplete,
    documentInfo: state.documentInfo,
    extensionsConfig: state.extensionsConfig,
    websocketStatus: state.serverConnection.websocketStatus
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onSetDocumentInfo: documentInfo => dispatch(setDocumentInfo(documentInfo))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(sizeMe()(AppContainer)))
import React from 'react';
import { withRouter } from 'react-router-dom';
import cn from 'classnames'
import './scrollbar.css'

import { MAIN_APPBAR_HEIGHT } from './utils/styles'

// LABBOX-CUSTOM /////////////////////////////////////////////
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import RootAppBar from './components/RootAppBar';



const useStyles = makeStyles((theme) => ({
    container: {
        padding: '60px 20px',
        height: `calc(100vh - ${MAIN_APPBAR_HEIGHT}px)`,
    }
}));


const AppContainer = ({ children, documentInfo, extensionsConfig }) => {
    const classes = useStyles();

    return (
        <div className={"TheAppBar"}>
            <RootAppBar documentInfo={documentInfo} extensionsConfig={extensionsConfig} />
            <div className={classes.container}>
                {children}
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        documentInfo: state.documentInfo,
        extensionsConfig: state.extensionsConfig,
        currentUser: state.login.currentUser

    }
}


export default withRouter(connect(
    mapStateToProps
)(AppContainer))
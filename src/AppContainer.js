import React from 'react';
import { withRouter } from 'react-router-dom';
import cn from 'classnames'
import './scrollbar.css'

import { MAIN_APPBAR_HEIGHT } from './utils/styles'

// LABBOX-CUSTOM /////////////////////////////////////////////
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import RootAppBar from './components/RootAppBar';

const drawerWidth = 480

const useStyles = makeStyles((theme) => ({
    container: {
        padding: '60px 20px',
        height: `calc(100vh - ${MAIN_APPBAR_HEIGHT}px)`,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginRight: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
    },
}));


const AppContainer = ({ children, documentInfo, extensionsConfig }) => {
    const classes = useStyles();

    return (
        <div className={"TheAppBar"}>
            <RootAppBar documentInfo={documentInfo} extensionsConfig={extensionsConfig} />
            <div className={cn(classes.container, classes.content, {
                [classes.contentShift]: true
            })}>
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
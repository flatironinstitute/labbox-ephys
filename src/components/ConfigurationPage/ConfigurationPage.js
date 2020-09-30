import React from 'react'
import { makeStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import { connect } from 'react-redux';
import { setExtensionEnabled } from '../../actions';
import LeftContainer from './components/LeftContainer'
import RightContainer from './components/RightContainer'

const useStyles = makeStyles((theme) => ({
    container: {
        margin: '20px 10px'
    },
    gridContainer: {
        padding: '56px 38px'
    }
}))


const ConfigurationPage = (props) => {
    const { extensionsConfig } = props
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <Grid container className={classes.gridContainer} spacing={4}>
                <Grid item xs={7}>
                    <LeftContainer {...props} />
                </Grid>
                <Grid item xs={5}>
                    {extensionsConfig.enabled.frankLabDataJoint && <RightContainer />}
                </Grid>
            </Grid>
        </div>
    )
}

const mapStateToProps = state => ({
    documentInfo: state.documentInfo,
    defaultFeedId: state.serverInfo.defaultFeedId,
    nodeId: state.serverInfo.nodeId,
    extensionsConfig: state.extensionsConfig
})

const mapDispatchToProps = dispatch => ({
    onSetExtensionEnabled: (extensionName, value) => dispatch(setExtensionEnabled(extensionName, value))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigurationPage)


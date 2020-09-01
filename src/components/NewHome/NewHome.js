import React from 'react';
import { makeStyles } from '@material-ui/core'
//import RecordingsTable from '../../containers/RecordingsTable';
import { connect } from 'react-redux';
import Header from './components/Header'
import Grid from '@material-ui/core/Grid'
import VirtualGrid from './components/VirtualGrid';

const useStyles = makeStyles((theme) => ({
    container: {
        margin: '20px 10px'
    },
    gridContainer: {
        padding: '20px 20px'
    }
}))

const NewHome = ({ documentInfo }) => {
    const classes = useStyles()
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
    documentInfo: state.documentInfo,
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewHome)

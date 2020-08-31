import React from 'react';
import { makeStyles } from '@material-ui/core'
import RecordingsTable from '../../containers/RecordingsTable';
import { connect } from 'react-redux';
import Header from './components/Header'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles((theme) => ({
    container: {
        margin: '20px 10px'
    }
}))

const NewHome = ({ documentInfo }) => {
    const classes = useStyles()
    return (
        <Grid container alignItems="stretch" className={classes.container}>
            <Grid item xs={12}>
                <Header documentInfo={documentInfo} />
            </Grid>
            <Grid xs={12} >
                <RecordingsTable />
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

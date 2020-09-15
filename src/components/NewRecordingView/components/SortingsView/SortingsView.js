import React from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core'
import UpperGrid from './components/UpperGrid/UpperGrid'
import ActionsGrid from './components/ActionsGrid'
import ValidationsGrid from './components/ValidationsGrid'

const useStyles = makeStyles((theme) => ({
    container: {
        margin: 40
    },
}))

const SortingsView = (props) => {
    const classes = useStyles()
    return (
        <Grid container className={classes.container}>
            <Grid item xs={12}>
                <UpperGrid {...props} />
            </Grid>
            <Grid item xs={12}>
                <ActionsGrid {...props} />
            </Grid>
            <Grid item xs={12}>
                <ValidationsGrid {...props} />
            </Grid>
        </Grid>
    )
}

export default SortingsView


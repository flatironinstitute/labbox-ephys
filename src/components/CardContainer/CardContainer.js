import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import CardItem from './components/CardItem'

const useStyles = makeStyles(() => ({
    gridRoot: {
        paddingRight: 15,
        paddingBottom: 30
    }
}))

const CardContainer = (props) => {
    const classes = useStyles();
    const { firstCard, secondCard, thirdCard, fourthCard } = props

    return (
        <Grid container spacing={2} className={classes.gridRoot}>
            <Grid item xs={6}>
                <CardItem title={firstCard.title} content={firstCard.content} />
            </Grid>
            <Grid item xs={6}>
                <CardItem title={secondCard.title} content={secondCard.content} />
            </Grid>
            <Grid item xs={6}>
                <CardItem title={thirdCard.title} content={thirdCard.content} />
            </Grid>
            <Grid item xs={6}>
                <CardItem title={fourthCard.title} content={fourthCard.content} />
            </Grid>
        </Grid>

    )
}

export default CardContainer

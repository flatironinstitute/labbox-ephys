import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core'
import CustomField from '../CustomField'
import CardItem from '../../../../../CardItem'
import cn from 'classnames'
import CardContainer from '../../../../../CardContainer'

const useStyles = makeStyles((theme) => ({
    margin: {
        marginBottom: 40
    },
    title: {
        fontSize: 20,
        fontWeight: 600,
        color: theme.palette.type === 'dark'
            ? theme.palette.colors.darkWhite
            : theme.palette.colors.darkGrey
    },
    card: {
        backgroundColor: theme.palette.colors.green,
        width: '100%',
        maxWidth: '100%',
        height: 150
    },
    cardTitle: {
        fontSize: 34
    },
    cardContent: {
        fontSize: 50,
        fontWeight: 'bold'
    },
    columnLeft: {
        borderRight: `1px solid ${theme.palette.colors.grey3}`,
        paddingRight: 40,
        height: '100%'
    },
    columnRight: {
        padding: '0px 40px',
    },
    singleCard: {
        backgroundColor: theme.palette.colors.orange,
    },
    cardContainer: {
        marginTop: 10
    }
}))


const UpperGrid = (props) => {
    const classes = useStyles()
    // const { sortings } = props
    /** all displayed value are a simple test */
    const sortingID = 'Sorting id Test'
    const sortingMethod = 'Sorting Method Test'

    const firstCard = {
        title: 'Min Spike Count',
        content: '100'
    }
    const secondCard = {
        title: 'Min Spike Amplitude',
        content: '50uV'
    }
    const thirdCard = {
        title: 'Max L-ratio',
        content: '128'
    }
    const fourthCard = {
        title: 'Max ISI Index',
        content: '0.2'
    }

    return (
        <Grid
            container
            justify="space-between"
            alignItems="stretch"
        >
            <Grid item xs={6} className={classes.columnLeft}>
                <Typography className={cn(classes.margin, classes.title)}>
                    Data Statitics
                </Typography>
                <CustomField
                    title='Sorting ID'
                    label={sortingID}
                    fullWidth
                    className={classes.margin}
                />
                <CustomField
                    title='Sorting Method'
                    label={sortingMethod}
                    fullWidth
                    className={classes.margin}
                />
                <CardItem
                    title='Isolated single units'
                    content='500'
                    rootStyle={classes.card}
                    titleStyle={classes.cardTitle}
                    contentStyle={classes.cardContent}
                />
            </Grid>
            <Grid item xs={6} className={classes.columnRight}>
                <Typography className={cn(classes.margin, classes.title)}>
                    Sorting Methodology
                </Typography>
                <CustomField
                    title='Spike Detection Threshold'
                    subtitle="(sigma rms noise)"
                    label='5'
                    fullWidth
                    className={classes.margin}

                />
                <CardContainer
                    className={classes.cardContainer}
                    firstCard={firstCard}
                    secondCard={secondCard}
                    thirdCard={thirdCard}
                    fourthCard={fourthCard}
                    rootStyle={classes.singleCard}
                />
            </Grid>
        </Grid>
    )
}

export default UpperGrid

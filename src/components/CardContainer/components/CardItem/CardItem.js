import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: 10,
        maxWidth: 185,
        height: 96,
        backgroundColor: theme.palette.colors.purple
    },
    title: {
        fontSize: 14,
        color: theme.palette.colors.white
    },
    pos: {
        fontSize: 34,
        margin: '5px 0px',
        color: theme.palette.colors.white
    },
}))

const CardItem = ({ title, content }) => {
    const classes = useStyles();

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography noWrap className={classes.title} >
                    {title}
                </Typography>
                <Typography noWrap className={classes.pos} >
                    {content}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default CardItem

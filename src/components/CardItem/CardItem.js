import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import cn from 'classnames'

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: 10,
        maxWidth: 185,
        height: 96,
        backgroundColor: theme.palette.colors.purple,
        filter:
            'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.14)) drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.12)) drop-shadow(0px 1px 5px rgba(0, 0, 0, 0.2))'
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
    loading: {
        color: theme.palette.colors.white
    }
}))

const CardItem = ({ title, content, rootStyle, titleStyle, contentStyle }) => {
    const classes = useStyles();

    return (
        <Card className={cn(rootStyle, classes.root)}>
            <CardContent>
                <Typography noWrap className={cn(titleStyle, classes.title)} >
                    {title}
                </Typography>
                {content ? <Typography noWrap className={cn(contentStyle, classes.pos)} >
                    {content}
                </Typography> : <CircularProgress className={classes.loading} />}
            </CardContent>
        </Card>
    )
}

export default CardItem

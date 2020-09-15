import React from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    title: {
        marginBottom: 40,
        fontSize: 20,
        fontWeight: 600,
        color: theme.palette.type === 'dark'
            ? theme.palette.colors.darkWhite
            : theme.palette.colors.darkGrey
    },
    button: {
        padding: '5px 20px',
        marginRight: theme.spacing(4),
        backgroundColor: theme.palette.colors.lightBlue,
        color: theme.palette.colors.white,
        textTransform: 'none',
        borderRadius: 6,
        boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.14), 0px 1px 8px rgba(0, 0, 0, 0.2)',
        '&:hover': {
            backgroundColor: theme.palette.colors.lightBlue1
        }
    },
    container: {
        marginBottom: 40
    }
}))

const ActionsGrid = (props) => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <Typography className={classes.title}>
                Actions
            </Typography>
            <Button variant='contained' className={classes.button}>
                <Typography noWrap>
                    Download Sorting
                </Typography>
            </Button>

            <Button variant='contained' className={classes.button}>
                <Typography noWrap>
                    View Sorting
                </Typography>
            </Button>
            <Button variant='contained' className={classes.button}>
                <Typography noWrap>
                    Validate Sorting
                </Typography>
            </Button>
        </div>
    )
}

export default ActionsGrid

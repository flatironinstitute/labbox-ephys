import React from 'react'
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: 20,
        color: theme.palette.type === 'dark'
            ? theme.palette.colors.darkWhite
            : theme.palette.colors.darkGrey
    }
}))

const InfoPanelItem = ({ title, children }) => {
    const classes = useStyles()
    return (
        <>
            <Typography className={classes.title}>
                {title}
            </Typography>
            {children}
        </>
    )
}

export default InfoPanelItem

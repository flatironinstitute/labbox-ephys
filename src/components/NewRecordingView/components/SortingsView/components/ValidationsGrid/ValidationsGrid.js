import React from 'react'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import AvatarGroup from '@material-ui/lab/AvatarGroup'
import { makeStyles } from '@material-ui/core'
import { users } from './mockUser'

const useStyles = makeStyles((theme) => ({
    title: {
        marginBottom: 20,
        fontSize: 20,
        fontWeight: 600,
        color: theme.palette.type === 'dark'
            ? theme.palette.colors.darkWhite
            : theme.palette.colors.darkGrey
    },
}))

const ValidationsGrid = () => {
    const classes = useStyles()
    const numUser = users.length
    return (
        <>
            <Typography className={classes.title}>
                Sorting Valited by ({numUser})
            </Typography>
            <AvatarGroup max={30}>
                {users.map(user => (
                    <Avatar alt={user.name} src={user.image} />
                ))}
            </AvatarGroup>
        </>
    )
}

export default ValidationsGrid


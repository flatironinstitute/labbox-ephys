import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PrivateLink from '../PrivateLink'

const useStyles = makeStyles((theme) => ({
    icon: {
        color: theme.palette.colors.white
    }
}));

const DropdownAccount = () => {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    /** used to simulate logout */
    const handleLogout = () => {
        sessionStorage.clear()
        window.location.reload()
    }

    return (
        <>
            <PrivateLink preventDefault to="/">
                <IconButton onClick={handleClick}>
                    <PersonIcon className={classes.icon} />
                </IconButton>
            </PrivateLink>
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    )
}

export default DropdownAccount


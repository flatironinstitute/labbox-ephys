import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import CancelRoundedIcon from '@material-ui/icons/CancelRounded';

/** use this array until BE is missing */
const publicationsTest = [
    '1. Wu et al., Neuron, 2015',
    '1. Wu fal., Joijon, 2015',
    '1. Et Wu loki., Falgar, 2015'
]

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: 200,
        maxHeight: 200,
        width: '90%',
        marginBottom: 20,
        overflowY: 'auto'
    },
    listItem: {
        borderBottom: `2px solid ${theme.palette.colors.grey3}`
    },
    deleteIcon: {
        color: theme.palette.colors.grey4
    }
}));

const ListContainer = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <List>
                {publicationsTest.map(publication =>
                    <ListItem key={publication} className={classes.listItem}>
                        <ListItemText
                            primary={publication}
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete">
                                <CancelRoundedIcon className={classes.deleteIcon} />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>,
                )}
            </List>
        </div>
    )
}

export default ListContainer

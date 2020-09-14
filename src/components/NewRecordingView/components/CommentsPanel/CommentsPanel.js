import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import CommentsCardList from '../../../CommentsCardList/CommentsCardList';

/* import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText'; */



const useStyles = makeStyles((theme) => ({
    container: {
        height: '100%',
        margin: 0,
        padding: 0
    },
    title: {
        fontSize: 24,
        margin: 35,
        borderBottom: `1px solid ${theme.palette.colors.grey2}`
    },
    newCommentContainer: {
        margin: 35,
        bottom: 0
    },
    list: {
        margin: '0px 35px',
        flexGrow: 1,
        maxHeight: 635,
        overflowY: 'auto'
    },
    paper: {
        zIndex: 0,
        width: 450,
        paddingTop: 65,
        backgroundColor: 'transparent',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.14), 0px 4px 5px rgba(0, 0, 0, 0.12), 0px 1px 10px rgba(0, 0, 0, 0.2)',
    }
}));



const CommentsPanel = () => {
    const classes = useStyles();

    return (
        <Drawer
            ModalProps={{
                keepMounted: true
            }}
            anchor="right"
            open={true}
            variant='persistent'
            classes={{
                paper: classes.paper
            }}
        >
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
                className={classes.container}
            >
                <Grid item>
                    <Typography className={classes.title}>Comments</Typography>
                </Grid>
                <Grid item className={classes.list}>
                    <CommentsCardList />
                </Grid>
                <Grid item className={classes.newCommentContainer}>
                    <TextField
                        placeholder='Add new Comment'
                        variant="outlined"
                        fullWidth
                    />
                </Grid>
            </Grid>
        </Drawer>
    )
}

export default CommentsPanel



import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
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
        margin: '0px 35px',
        borderBottom: `1px solid ${theme.palette.colors.grey2}`,
        paddingBottom: 10
    },
    newCommentContainer: {
        width: '23%',
        margin: 24,
        bottom: 0,
        position: 'fixed',
    },
    list: {
        margin: 10,
        marginLeft: 20,
        flexGrow: 1,
        maxHeight: '90ch',
        overflowY: 'auto'
    },
    paper: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        borderLeft: `1px solid ${theme.palette.colors.grey3}`
    },
    addComment: {
        backgroundColor: theme.palette.colors.white,
        '&::placeholder': {
            color: theme.palette.colors.grey,
            fontSize: 14
        }
    }
}));



const CommentsPanel = () => {
    const classes = useStyles();

    return (
        <Paper className={classes.paper} elevation={0}>
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
                        InputProps={{
                            classes: {
                                input: classes.addComment
                            }
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    )
}

export default CommentsPanel



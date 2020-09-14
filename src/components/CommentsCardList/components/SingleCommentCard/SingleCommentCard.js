import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: 'transparent',
    },
    icon: {
        color: theme.palette.colors.grey2,
        fontSize: 18
    },
    avatar: ({ currentStyle }) => ({
        fontSize: 14,
        border: currentStyle && `2px solid ${theme.palette.colors.lightBlue}`
    }),
    title: ({ currentStyle }) => ({
        fontSize: 16,
        padding: '0px !important',
        color: currentStyle && theme.palette.colors.lightBlue
    }),
    comment: {
        fontSize: 12,
        marginTop: 5
    },
    cardContent: {
        padding: '5px 0px'
    },
    action: {
        margin: 0
    }
}));

const SingleCommentCard = (props) => {
    const { fullname, comment, date, currentUser } = props
    const currentStyle = currentUser === fullname
    const classes = useStyles({ currentStyle });

    return (
        <Card className={classes.root} elevation={0} >
            <CardHeader
                avatar={
                    <Avatar
                        alt={fullname}
                        src="/broken-image.jpg"
                        className={classes.avatar}
                    />
                }
                action={currentStyle
                    ? (
                        <>
                            <IconButton onClick={() => { }}>
                                <DeleteIcon className={classes.icon} />
                            </IconButton>
                            <IconButton onClick={() => { }}>
                                <EditIcon className={classes.icon} />
                            </IconButton>
                        </>
                    ) : null
                }
                title={fullname}
                className={classes.title}
                classes={{
                    action: classes.action
                }}
            />
            <CardContent className={classes.cardContent}>
                <Typography className={classes.comment} >
                    {comment}
                </Typography>
                <Typography color="textSecondary" className={classes.comment}>
                    Date: {date}
                </Typography>
            </CardContent>
        </Card >
    );
}

export default SingleCommentCard
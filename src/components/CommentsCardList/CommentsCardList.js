import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import SingleCommentCard from './components/SingleCommentCard/SingleCommentCard';

const testComments = [
    {
        fullname: 'Jerome Jerry',
        comment: 'Aliquet purus diam dui sed integer sagittis lorem nunc. Imperdiet vulputate nulla vivamus leo facilisis. Eget blandit turpis commodo massa. Lacus pharetra lorem malesuada id. Tincidunt in id sit consequat dui ultricies commodo netus turpis. At faucibus aliquet at.',
        date: '08/05/2020 at 18:36'
    },
    {
        fullname: 'Slidon Poliw',
        comment: 'Scelerisque turpis dolor, pulvinar neque. Habitant tempus morbi ipsum urna feugiat sagittis orci risus eleifend. Egestas at in fermentum justo.',
        date: '08/05/2020 at 20:36'
    },
    {
        fullname: 'Fan Wu',
        comment: 'Aliquet purus diam dui sed integer sagittis lorem nunc. Imperdiet vulp utate nulla vivamus leo facilisis. Eget blandit turpis commodo massa. Lacus pharetra lorem malesuada id. Tincidunt in id sit consequat dui ultricies commodo netus turpis. At faucibus aliquet at.',
        date: '09/05/2020 at 10:31'
    },
]

const testCurrentUser = 'Fan Wu'


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    inline: {
        display: 'inline'
    }
}));

const CommentsCardList = () => {
    const classes = useStyles();

    return (
        <List className={classes.root}>
            {testComments.map(current => (
                <ListItem alignItems="flex-start">
                    <SingleCommentCard
                        currentUser={testCurrentUser}
                        fullname={current.fullname}
                        comment={current.comment}
                        date={current.date}
                    />
                </ListItem>
            ))}
        </List>
    );
}

export default CommentsCardList
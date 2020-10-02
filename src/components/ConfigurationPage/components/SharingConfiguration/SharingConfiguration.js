import React from 'react'
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import cn from 'classnames'

const useStyles = makeStyles((theme) => ({
    subtitle: {
        fontSize: 28,
        marginBottom: 24
    },
    content: {
        fontSize: 16,
        lineHeight: 2
    },
    grey: {
        color: theme.palette.colors.grey
    },
    primary: {
        color: theme.palette.colors.mainColor
    }
}))


const SharingConfiguration = ({ documentInfo, defaultFeedId }) => {
    const classes = useStyles()
    const { feedUri, documentId } = documentInfo;
    const resolvedFeedUri = feedUri || 'feed://' + defaultFeedId;
    return (
        <div>
            <Typography noWrap className={classes.subtitle}>
                Sharing
                </Typography>
            <Typography noWrap className={cn(classes.content, classes.grey)}>
                You can share the following information:
                </Typography>
            <Typography noWrap className={classes.content}>
                Feed URI: {<span className={classes.primary}>{resolvedFeedUri}</span>}
            </Typography>
            <Typography noWrap className={classes.content}>
                Document ID: {<span className={classes.primary}>{documentId || 'null'}</span>}
            </Typography>
            <Typography noWrap className={cn(classes.content, classes.primary)}>
                {`.../${documentId}?feed=${resolvedFeedUri}`}
            </Typography>
        </div>
    )
}

export default SharingConfiguration

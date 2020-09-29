import React from 'react'
import Grid from '@material-ui/core/Grid'
import InfoPanelItem from '../InfoPanelItem/InfoPanelItem'
import CardContainer from '../../../CardContainer'
import TagsContainer from '../../../TagsContainer'
import { makeStyles } from '@material-ui/core/styles'
import ListContainer from '../../../ListContainer'

const useStyles = makeStyles(() => ({
    gridRoot: {
        minHeight: 700,
        bottom: 0,
        width: '100%'
    }
}))


const RecordingInfoPanel = ({ recording }) => {
    const classes = useStyles()

    const firstCard = {
        title: 'Sample Rate',
        content: recording.recordingInfo
            ? recording.recordingInfo.sampling_frequency
            : '',
    }
    const secondCard = {
        title: 'Duration (sec)',
        content: recording.recordingInfo
            ? recording.recordingInfo.num_frames / recording.recordingInfo.sampling_frequency / 60
            : '',
    }

    const thirdCard = {
        title: 'Channel Count',
        content: recording.recordingInfo
            ? recording.recordingInfo.channel_ids.length
            : '',
    }

    const fourthCard = {
        title: 'Probe Design',
        content: ' '
    }


    return (
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
            className={classes.gridRoot}
        >
            <Grid item >
                <InfoPanelItem title={'Data'}>
                    <CardContainer
                        firstCard={firstCard}
                        secondCard={secondCard}
                        thirdCard={thirdCard}
                        fourthCard={fourthCard}
                    />
                </InfoPanelItem>
            </Grid>
            <Grid item >
                <InfoPanelItem title={'Tags'}>
                    <TagsContainer />
                </InfoPanelItem>
            </Grid>
            <Grid item style={{ width: '100%' }}>
                <InfoPanelItem title={'Publications'}>
                    <ListContainer />
                </InfoPanelItem>
            </Grid>

        </Grid>
    )
}

export default RecordingInfoPanel

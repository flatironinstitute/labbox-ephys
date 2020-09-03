import React from 'react'
import Grid from '@material-ui/core/Grid'
import InfoPanelItem from '../InfoPanelItem/InfoPanelItem'
import CardContainer from '../../../CardContainer'
import TagsContainer from '../../../TagsContainer'



const RecordingInfoPanel = (props) => {



    return (
        <Grid container justify="space-between" alignItems="flex-start">
            <Grid item xs={12}>
                <InfoPanelItem title={'Data'}>
                    <CardContainer {...props} />
                </InfoPanelItem>
            </Grid>
            <Grid item xs={12}>
                <InfoPanelItem title={'Tags'}>
                    <TagsContainer />
                </InfoPanelItem>
            </Grid>
            <Grid item xs={12}>
                <InfoPanelItem title={'Publications'}>
                    <div>publication container</div>
                </InfoPanelItem>
            </Grid>

        </Grid>
    )
}

export default RecordingInfoPanel

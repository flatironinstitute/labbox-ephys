import React from 'react'
import { Grid } from '@material-ui/core';
import ClientSidePlot from '../../components/ClientSidePlot';
import plotStyles from '../common/plotStyles';
import AverageWaveform_rv from './AverageWaveform_ReactVis';
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const AverageWaveforms = ({ sorting, recording, isSelected=() => {}, isFocused=() => {}, onUnitClicked }) => {
    return (
        <Grid container>
            {
                sorting.sortingInfo.unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <div style={plotStyles['plotWrapperStyle']}
                        >
                            <div
                                style={isSelected(unitId)
                                    ? (isFocused(unitId)
                                        ? plotStyles['plotFocusedStyle']
                                        : plotStyles['plotSelectedStyle']
                                    ) : plotStyles['unselectedStyle']}
                                onClick={(event) => onUnitClicked(unitId, event)}
                            >
                                <div style={{ 'textAlign': 'center' }}>
                                    <div>Unit {unitId}</div>
                                </div>
                                <ClientSidePlot
                                    dataFunctionName='fetch_average_waveform_plot_data'
                                    dataFunctionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        recording_object: recording.recordingObject,
                                        unit_id: unitId
                                    }}
                                    boxSize={{
                                        width: 200,
                                        height: 200
                                    }}
                                    plotComponent={AverageWaveform_rv}
                                    plotComponentArgs={{ id: 'plot-'+unitId }}
                                    useJobCache={true}
                                />
                            </div>
                        </div>
                    </Grid>
                ))
            }
        </Grid>
    );
}

const label = 'Average waveforms'

AverageWaveforms.sortingViewPlugin = {
    label: label
}

AverageWaveforms.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default AverageWaveforms
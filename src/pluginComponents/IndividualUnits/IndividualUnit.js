import React from 'react'
import ClientSidePlot from '../../components/ClientSidePlot';
import Correlogram_rv from '../CrossCorrelograms/Correlogram_ReactVis';
import { Grid } from '@material-ui/core';
import AverageWaveform_rv from '../AverageWaveforms/AverageWaveform_ReactVis';
import PCAFeatures_rv from './PCAFeatures_rv';

const IndividualUnit = ({sorting, recording, unitId, width, calculationPool}) => {
    return (
        <div style={{width}}>
            <div>
                <h3>Unit {unitId}</h3>
                <Grid container direction="row">
                    <Grid item>
                        {/* Autocorrelogram */}
                        <ClientSidePlot
                            dataFunctionName="createjob_fetch_correlogram_plot_data"
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                unit_x: unitId
                            }}
                            boxSize={{
                                width: 300,
                                height: 300
                            }}
                            title="Autocorrelogram"
                            plotComponent={Correlogram_rv}
                            plotComponentArgs={{id: unitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            jobHandlerName="partition1"
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                        />
                    </Grid>
                    <Grid item>
                        {/* Average waveform */}
                        <ClientSidePlot
                            dataFunctionName={'createjob_fetch_average_waveform_plot_data'}
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                recording_object: recording.recordingObject,
                                unit_id: unitId
                            }}
                            boxSize={{
                                width: 300,
                                height: 300
                            }}
                            plotComponent={AverageWaveform_rv}
                            plotComponentArgs={{id: unitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            jobHandlerName="partition2"
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                        />
                    </Grid>
                    <Grid item>
                        {/* Average waveform */}
                        <ClientSidePlot
                            dataFunctionName={'createjob_fetch_pca_features'}
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                recording_object: recording.recordingObject,
                                unit_id: unitId
                            }}
                            boxSize={{
                                width: 300,
                                height: 300
                            }}
                            plotComponent={PCAFeatures_rv}
                            plotComponentArgs={{id: unitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            jobHandlerName="partition2"
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                        />
                    </Grid>
                </Grid>
            </div>
        </div>
    )
}

export default IndividualUnit;
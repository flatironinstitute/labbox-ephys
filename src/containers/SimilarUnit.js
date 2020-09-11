import React from 'react'
import { Grid, Button } from '@material-ui/core';
import AverageWaveform_rv from '../pluginComponents/AverageWaveforms/AverageWaveform_ReactVis';
import Correlogram_rv from '../pluginComponents/CrossCorrelograms/Correlogram_ReactVis';
import PCAFeatures_rv from '../pluginComponents/IndividualUnits/PCAFeatures_rv';
import ClientSidePlot from '../components/ClientSidePlot';
import DriftFeatures_rv from '../pluginComponents/IndividualUnits/DriftFeatures_rv';

const SimilarUnit = ({sorting, recording, unitId, compareUnitId, width, calculationPool}) => {
    return (
        <div style={{width}}>
            <div>
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
                        {/* Cross-correlogram */}
                        <ClientSidePlot
                            dataFunctionName="createjob_fetch_correlogram_plot_data"
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                unit_x: unitId,
                                unit_y: compareUnitId
                            }}
                            boxSize={{
                                width: 300,
                                height: 300
                            }}
                            title={`Unit ${unitId} vs ${compareUnitId}`}
                            plotComponent={Correlogram_rv}
                            plotComponentArgs={{id: unitId+'-'+compareUnitId}}
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
                        {/* PCA features */}
                        <ClientSidePlot
                            dataFunctionName={'createjob_fetch_pca_features'}
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                recording_object: recording.recordingObject,
                                unit_ids: [unitId, compareUnitId]
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
                    <Grid item>
                        {/* Drift features */}
                        <ClientSidePlot
                            dataFunctionName={'createjob_fetch_pca_features'}
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                recording_object: recording.recordingObject,
                                unit_ids: [unitId, compareUnitId]
                            }}
                            boxSize={{
                                width: 600,
                                height: 300
                            }}
                            plotComponent={DriftFeatures_rv}
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

export default SimilarUnit;
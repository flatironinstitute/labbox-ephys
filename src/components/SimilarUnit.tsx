import { Grid } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import ClientSidePlot from '../extensions/common/ClientSidePlot';
import Correlogram_rv from '../extensions/correlograms/Correlogram_ReactVis';
import DriftFeatures_rv from '../extensions/devel/IndividualUnits/DriftFeatures_rv';
import PCAFeatures_rv from '../extensions/devel/IndividualUnits/PCAFeatures_rv';
import { CalculationPool, HitherContext } from '../extensions/extensionInterface';
import AverageWaveform_rv from '../extensions/old/averagewaveformsold/AverageWaveform_ReactVis';
import { Recording } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';

const SimilarUnit: FunctionComponent<{
    sorting: Sorting, recording: Recording, unitId: number, compareUnitId: number, width: number, calculationPool: CalculationPool, hither: HitherContext
}> = ({sorting, recording, unitId, compareUnitId, width, calculationPool, hither}) => {
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
                            PlotComponent={Correlogram_rv}
                            plotComponentArgs={{id: unitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                            hither={hither}
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
                            PlotComponent={Correlogram_rv}
                            plotComponentArgs={{id: unitId+'-'+compareUnitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                            hither={hither}
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
                            PlotComponent={AverageWaveform_rv}
                            plotComponentArgs={{id: unitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                            title=""
                            hither={hither}
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
                            PlotComponent={PCAFeatures_rv}
                            plotComponentArgs={{id: unitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                            title=""
                            hither={hither}
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
                            PlotComponent={DriftFeatures_rv}
                            plotComponentArgs={{id: unitId}}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                            title=""
                            hither={hither}
                        />
                    </Grid>
                </Grid>
            </div>
        </div>
    )
}

export default SimilarUnit;
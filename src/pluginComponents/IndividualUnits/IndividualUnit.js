import React, { useState } from 'react'
import ClientSidePlot from '../../components/ClientSidePlot';
import Correlogram_rv from '../CrossCorrelograms/Correlogram_ReactVis';
import { Grid } from '@material-ui/core';
import AverageWaveform_rv from '../AverageWaveforms/AverageWaveform_ReactVis';
import PCAFeatures_rv from './PCAFeatures_rv';
import DriftFeatures_rv from './DriftFeatures_rv';
import SpikeWaveforms_rv from './SpikeWaveforms_rv';

const IndividualUnit = ({ sorting, recording, unitId, width, calculationPool, sortingInfo }) => {
    const [selectedPointIndex, setSelectedPointIndex] = useState(null);
    const _handlePointClicked = ({ index }) => {
        setSelectedPointIndex(index);
    }
    return (
        <div style={{ width }}>
            <div>
                <Grid container direction="row">
                    <Grid item key="autocorrelogram">
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
                            plotComponentArgs={{ id: unitId }}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                        />
                    </Grid>
                    <Grid item key="average-waveform">
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
                            plotComponentArgs={{ id: unitId }}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                        />
                    </Grid>
                    <Grid item key="pca-features">
                        {/* PCA features */}
                        <ClientSidePlot
                            dataFunctionName={'createjob_fetch_pca_features'}
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                recording_object: recording.recordingObject,
                                unit_ids: [unitId]
                            }}
                            boxSize={{
                                width: 300,
                                height: 300
                            }}
                            plotComponent={PCAFeatures_rv}
                            plotComponentArgs={{ id: unitId, onPointClicked: ({ index }) => _handlePointClicked({ index }) }}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                        />
                    </Grid>
                    <Grid item key="drift">
                        {/* Drift */}
                        <ClientSidePlot
                            dataFunctionName={'createjob_fetch_pca_features'}
                            dataFunctionArgs={{
                                sorting_object: sorting.sortingObject,
                                recording_object: recording.recordingObject,
                                unit_ids: [unitId]
                            }}
                            boxSize={{
                                width: 600,
                                height: 300
                            }}
                            plotComponent={DriftFeatures_rv}
                            plotComponentArgs={{ id: unitId, onPointClicked: ({ index }) => _handlePointClicked({ index }) }}
                            newHitherJobMethod={true}
                            useJobCache={true}
                            requiredFiles={sorting.sortingObject}
                            calculationPool={calculationPool}
                        />
                    </Grid>
                    {
                        sortingInfo && (
                            <Grid item key={"example-waveforms"}>
                                {/* Example waveforms */}
                                <ClientSidePlot
                                    dataFunctionName={'createjob_fetch_spike_waveforms'}
                                    dataFunctionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        recording_object: recording.recordingObject,
                                        unit_ids: [unitId],
                                        spike_indices: [spikeIndexSubset(sortingInfo.unit_ids.length, 20)]
                                    }}
                                    boxSize={{
                                        width: 300,
                                        height: 300
                                    }}
                                    title="Example waveforms"
                                    plotComponent={SpikeWaveforms_rv}
                                    plotComponentArgs={{ id: unitId + '-' + selectedPointIndex }}
                                    newHitherJobMethod={true}
                                    useJobCache={true}
                                    requiredFiles={sorting.sortingObject}
                                    calculationPool={calculationPool}
                                    selectedPointIndex={selectedPointIndex} /* To force rerender */
                                />
                            </Grid>
                        )
                    }
                    {
                        /* Individual waveform */
                        (selectedPointIndex !== null) && (
                            <Grid item key={"waveform-" + selectedPointIndex}>
                                <ClientSidePlot
                                    dataFunctionName={'createjob_fetch_spike_waveforms'}
                                    dataFunctionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        recording_object: recording.recordingObject,
                                        unit_ids: [unitId],
                                        spike_indices: [[selectedPointIndex]]
                                    }}
                                    boxSize={{
                                        width: 300,
                                        height: 300
                                    }}
                                    plotComponent={SpikeWaveforms_rv}
                                    plotComponentArgs={{ id: unitId + '-' + selectedPointIndex }}
                                    newHitherJobMethod={true}
                                    useJobCache={true}
                                    requiredFiles={sorting.sortingObject}
                                    calculationPool={calculationPool}
                                    selectedPointIndex={selectedPointIndex} /* To force rerender */
                                />
                            </Grid>
                        )
                    }
                </Grid>
            </div>
        </div>
    )
}

const spikeIndexSubset = (n, maxNum) => {
    const ret = [];
    const incr = Math.ceil(n / maxNum);
    for (let i = 0; i < n; i+= incr) {
        ret.push(i);
    }
    return ret;
}

export default IndividualUnit;
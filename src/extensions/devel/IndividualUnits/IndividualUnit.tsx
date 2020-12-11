import { Grid } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import ClientSidePlot from '../../common/ClientSidePlot';
import { CalculationPool, HitherContext, Plugins, Recording, Sorting, SortingInfo } from '../../extensionInterface';
import sortByPriority from '../../sortByPriority';
import DriftFeatures_rv from './DriftFeatures_rv';
import PCAFeatures_rv from './PCAFeatures_rv';
import SpikeWaveforms_rv from './SpikeWaveforms_rv';

interface Props {
    sorting: Sorting
    recording: Recording
    unitId: number
    width: number
    calculationPool: CalculationPool
    sortingInfo: SortingInfo
    plugins: Plugins
    hither: HitherContext
}

const PcaFeatures: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool, onSelectedSpikeIndexChanged: (index: number | null) => void, hither: HitherContext}> = ({ sorting, recording, unitId, calculationPool, onSelectedSpikeIndexChanged, hither }) => {
    const _handlePointClicked = ({index}: { index: number | null }) => {
        onSelectedSpikeIndexChanged(index);
    }
    return (
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
            plotComponentArgs={{ id: unitId, onPointClicked: ({index}: { index: number }) => _handlePointClicked({ index }) }}
            newHitherJobMethod={true}
            useJobCache={true}
            requiredFiles={sorting.sortingObject}
            calculationPool={calculationPool}
            title=""
            hither={hither}
        />
    )
}

const Drift: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool, onSelectedSpikeIndexChanged: (index: number | null) => void, hither: HitherContext}> = ({ sorting, recording, unitId, calculationPool, onSelectedSpikeIndexChanged, hither }) => {
    const _handlePointClicked = ({index}: { index: number }) => {
        onSelectedSpikeIndexChanged(index);
    }
    return (
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
            plotComponentArgs={{ id: unitId, onPointClicked: ({index}: { index: number }) => _handlePointClicked({ index }) }}
            newHitherJobMethod={true}
            useJobCache={true}
            requiredFiles={sorting.sortingObject}
            calculationPool={calculationPool}
            title=""
            hither={hither}
        />
    )
}

const ExampleWaveforms: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool, selectedSpikeIndex: number | null, onSelectedSpikeIndexChanged: (index: number | null) => void, hither: HitherContext}> = ({ sorting, recording, unitId, calculationPool, selectedSpikeIndex, onSelectedSpikeIndexChanged, hither }) => {
    const _handlePointClicked = ({index}: { index: number }) => {
        onSelectedSpikeIndexChanged(index);
    }
    return (
        sorting.sortingInfo ? (
            <ClientSidePlot
                dataFunctionName={'createjob_fetch_spike_waveforms'}
                dataFunctionArgs={{
                    sorting_object: sorting.sortingObject,
                    recording_object: recording.recordingObject,
                    unit_ids: [unitId],
                    spike_indices: [spikeIndexSubset(sorting.sortingInfo.unit_ids.length, 20)]
                }}
                boxSize={{
                    width: 300,
                    height: 300
                }}
                title="Example waveforms"
                plotComponent={SpikeWaveforms_rv}
                plotComponentArgs={{ id: unitId + '-' + selectedSpikeIndex }}
                newHitherJobMethod={true}
                useJobCache={true}
                requiredFiles={sorting.sortingObject}
                calculationPool={calculationPool}
                // selectedSpikeIndex={selectedSpikeIndex} /* To force rerender */
                hither={hither}
            />
        ) : <div>No sorting info</div>
    )
}

const IndividualUnit: FunctionComponent<Props> = ({ sorting, recording, unitId, width, calculationPool, sortingInfo, plugins, hither }) => {
    const [selectedSpikeIndex, setSelectedSpikeIndex] = useState<number | null>(null);
    const handleSelectedPointIndexChanged = useCallback(
        (index: number | null) => {
            setSelectedSpikeIndex(index)
        },
        [setSelectedSpikeIndex]
    )
    
    return (
        <div style={{ width }}>
            <div>
                <Grid container direction="row">
                    {
                        sortByPriority(plugins.sortingUnitViews).filter(v => (!v.disabled)).map(suv => (
                            <Grid item key={suv.name}>
                                <suv.component
                                    sorting={sorting}
                                    recording={recording}
                                    unitId={unitId}
                                    calculationPool={calculationPool}
                                    selectedSpikeIndex={selectedSpikeIndex}
                                    onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
                                    plugins={plugins}
                                    hither={hither}
                                />
                            </Grid>
                        ))
                    }
                    <Grid item key="pca-features">
                        {/* PCA features */}
                        <PcaFeatures
                            sorting={sorting}
                            recording={recording}
                            unitId={unitId}
                            calculationPool={calculationPool}
                            onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
                            hither={hither}
                        />
                    </Grid>
                    <Grid item key="drift">
                        {/* Drift */}
                        <Drift
                            sorting={sorting}
                            recording={recording}
                            unitId={unitId}
                            calculationPool={calculationPool}
                            onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
                            hither={hither}
                        />
                    </Grid>
                    {
                        sortingInfo && (
                            <Grid item key={"example-waveforms"}>
                                {/* Example waveforms */}
                                <ExampleWaveforms
                                    sorting={sorting}
                                    recording={recording}
                                    unitId={unitId}
                                    calculationPool={calculationPool}
                                    selectedSpikeIndex={selectedSpikeIndex}
                                    onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
                                    hither={hither}
                                />
                            </Grid>
                        )
                    }
                    {
                        /* Individual waveform */
                        (selectedSpikeIndex !== null) && (
                            <Grid item key={"waveform-" + selectedSpikeIndex}>
                                <ClientSidePlot
                                    dataFunctionName={'createjob_fetch_spike_waveforms'}
                                    dataFunctionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        recording_object: recording.recordingObject,
                                        unit_ids: [unitId],
                                        spike_indices: [[selectedSpikeIndex]]
                                    }}
                                    boxSize={{
                                        width: 300,
                                        height: 300
                                    }}
                                    plotComponent={SpikeWaveforms_rv}
                                    plotComponentArgs={{ id: unitId + '-' + selectedSpikeIndex }}
                                    newHitherJobMethod={true}
                                    useJobCache={true}
                                    requiredFiles={sorting.sortingObject}
                                    calculationPool={calculationPool}
                                    // selectedSpikeIndex={selectedSpikeIndex} /* To force rerender */
                                    title=""
                                    hither={hither}
                                />
                            </Grid>
                        )
                    }
                </Grid>
            </div>
        </div>
    )
}

const spikeIndexSubset = (n: number, maxNum: number) => {
    const ret = [];
    const incr = Math.ceil(n / maxNum);
    for (let i = 0; i < n; i+= incr) {
        ret.push(i);
    }
    return ret;
}

export default IndividualUnit;
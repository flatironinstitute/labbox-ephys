import { CalculationPool } from 'labbox';
import React, { FunctionComponent } from 'react';
import { Recording, Sorting, SortingInfo } from "../../pluginInterface";

interface Props {
    sorting: Sorting
    recording: Recording
    unitId: number
    width: number
    calculationPool: CalculationPool
    sortingInfo: SortingInfo
}

// const PcaFeatures: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool, onSelectedSpikeIndexChanged: (index: number | null) => void}> = ({ sorting, recording, unitId, calculationPool, onSelectedSpikeIndexChanged }) => {
//     const _handlePointClicked = ({index}: { index: number | null }) => {
//         onSelectedSpikeIndexChanged(index);
//     }
//     return (
//         <ClientSidePlot
//             dataFunctionName={'createjob_fetch_pca_features'}
//             dataFunctionArgs={{
//                 sorting_object: sorting.sortingObject,
//                 recording_object: recording.recordingObject,
//                 unit_ids: [unitId]
//             }}
//             boxSize={{
//                 width: 300,
//                 height: 300
//             }}
//             PlotComponent={PCAFeatures_rv}
//             plotComponentArgs={{ id: unitId, onPointClicked: ({index}: { index: number }) => _handlePointClicked({ index }) }}
//             calculationPool={calculationPool}
//             title=""
//         />
//     )
// }

// const Drift: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool, onSelectedSpikeIndexChanged: (index: number | null) => void}> = ({ sorting, recording, unitId, calculationPool, onSelectedSpikeIndexChanged }) => {
//     const _handlePointClicked = ({index}: { index: number }) => {
//         onSelectedSpikeIndexChanged(index);
//     }
//     return (
//         <ClientSidePlot
//             dataFunctionName={'createjob_fetch_pca_features'}
//             dataFunctionArgs={{
//                 sorting_object: sorting.sortingObject,
//                 recording_object: recording.recordingObject,
//                 unit_ids: [unitId]
//             }}
//             boxSize={{
//                 width: 600,
//                 height: 300
//             }}
//             PlotComponent={DriftFeatures_rv}
//             plotComponentArgs={{ id: unitId, onPointClicked: ({index}: { index: number }) => _handlePointClicked({ index }) }}
//             calculationPool={calculationPool}
//             title=""
//         />
//     )
// }

// const ExampleWaveforms: FunctionComponent<{sorting: Sorting, recording: Recording, unitId: number, calculationPool: CalculationPool, selectedSpikeIndex: number | null, onSelectedSpikeIndexChanged: (index: number | null) => void}> = ({ sorting, recording, unitId, calculationPool, selectedSpikeIndex, onSelectedSpikeIndexChanged }) => {
//     const _handlePointClicked = ({index}: { index: number }) => {
//         onSelectedSpikeIndexChanged(index);
//     }
//     return (
//         sorting.sortingInfo ? (
//             <ClientSidePlot
//                 dataFunctionName={'createjob_fetch_spike_waveforms'}
//                 dataFunctionArgs={{
//                     sorting_object: sorting.sortingObject,
//                     recording_object: recording.recordingObject,
//                     unit_ids: [unitId],
//                     spike_indices: [spikeIndexSubset(sorting.sortingInfo.unit_ids.length, 20)]
//                 }}
//                 boxSize={{
//                     width: 300,
//                     height: 300
//                 }}
//                 title="Example waveforms"
//                 PlotComponent={SpikeWaveforms_rv}
//                 plotComponentArgs={{ id: unitId + '-' + selectedSpikeIndex }}
//                 calculationPool={calculationPool}
//                 // selectedSpikeIndex={selectedSpikeIndex} /* To force rerender */
//             />
//         ) : <div>No sorting info</div>
//     )
// }

const IndividualUnit: FunctionComponent<Props> = ({ sorting, recording, unitId, width, calculationPool, sortingInfo }) => {
    return <div>IndividualUnit: obsolete</div>
    // const [selectedSpikeIndex, setSelectedSpikeIndex] = useState<number | null>(null);
    // const handleSelectedPointIndexChanged = useCallback(
    //     (index: number | null) => {
    //         setSelectedSpikeIndex(index)
    //     },
    //     [setSelectedSpikeIndex]
    // )
    
    // return (
    //     <div style={{ width }}>
    //         <div>
    //             <Grid container direction="row">
    //                 {
    //                     sortByPriority(plugins.sortingUnitViews).filter(v => (!v.disabled)).map(suv => (
    //                         <Grid item key={suv.name}>
    //                             <suv.component
    //                                 sorting={sorting}
    //                                 recording={recording}
    //                                 unitId={unitId}
    //                                 calculationPool={calculationPool}
    //                                 selectedSpikeIndex={selectedSpikeIndex}
    //                                 onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
    //                                 plugins={plugins}
    //                                 hither={hither}
    //                             />
    //                         </Grid>
    //                     ))
    //                 }
    //                 <Grid item key="pca-features">
    //                     {/* PCA features */}
    //                     <PcaFeatures
    //                         sorting={sorting}
    //                         recording={recording}
    //                         unitId={unitId}
    //                         calculationPool={calculationPool}
    //                         onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
    //                         hither={hither}
    //                     />
    //                 </Grid>
    //                 <Grid item key="drift">
    //                     {/* Drift */}
    //                     <Drift
    //                         sorting={sorting}
    //                         recording={recording}
    //                         unitId={unitId}
    //                         calculationPool={calculationPool}
    //                         onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
    //                         hither={hither}
    //                     />
    //                 </Grid>
    //                 {
    //                     sortingInfo && (
    //                         <Grid item key={"example-waveforms"}>
    //                             {/* Example waveforms */}
    //                             <ExampleWaveforms
    //                                 sorting={sorting}
    //                                 recording={recording}
    //                                 unitId={unitId}
    //                                 calculationPool={calculationPool}
    //                                 selectedSpikeIndex={selectedSpikeIndex}
    //                                 onSelectedSpikeIndexChanged={handleSelectedPointIndexChanged}
    //                                 hither={hither}
    //                             />
    //                         </Grid>
    //                     )
    //                 }
    //                 {
    //                     /* Individual waveform */
    //                     (selectedSpikeIndex !== null) && (
    //                         <Grid item key={"waveform-" + selectedSpikeIndex}>
    //                             <ClientSidePlot
    //                                 dataFunctionName={'createjob_fetch_spike_waveforms'}
    //                                 dataFunctionArgs={{
    //                                     sorting_object: sorting.sortingObject,
    //                                     recording_object: recording.recordingObject,
    //                                     unit_ids: [unitId],
    //                                     spike_indices: [[selectedSpikeIndex]]
    //                                 }}
    //                                 boxSize={{
    //                                     width: 300,
    //                                     height: 300
    //                                 }}
    //                                 PlotComponent={SpikeWaveforms_rv}
    //                                 plotComponentArgs={{ id: unitId + '-' + selectedSpikeIndex }}
    //                                 calculationPool={calculationPool}
    //                                 // selectedSpikeIndex={selectedSpikeIndex} /* To force rerender */
    //                                 title=""
    //                                 hither={hither}
    //                             />
    //                         </Grid>
    //                     )
    //                 }
    //             </Grid>
    //         </div>
    //     </div>
    // )
}

// const spikeIndexSubset = (n: number, maxNum: number) => {
//     const ret = [];
//     const incr = Math.ceil(n / maxNum);
//     for (let i = 0; i < n; i+= incr) {
//         ret.push(i);
//     }
//     return ret;
// }

export default IndividualUnit;
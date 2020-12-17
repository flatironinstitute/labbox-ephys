import React from 'react';
import createCalculationPool from '../common/createCalculationPool';
import PlotGrid from '../common/PlotGrid';
import { SortingViewProps } from '../extensionInterface';
import AverageWaveformPlotNew from './AverageWaveformPlotNew';

const averageWaveformsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const AverageWaveformsNew: React.FunctionComponent<SortingViewProps> = (props) => {
    const { selection } = props
    // const { hither } = props
    // const [calcMode, setCalcMode] = useState('waiting')
    // const [result, setResult] = useState<any>(null)
    // useEffect(() => {
    //     if (calcMode === 'waiting') {
    //         setCalcMode('running')
    //         hither.createHitherJob('createjob_test_func_1', {}, {}).wait().then(r => {
    //             setResult(r)
    //             setCalcMode('finished')
    //         })
    //     }
    // }, [hither, setResult, calcMode, setCalcMode])
    // return <div>AAAA: {calcMode} {result + ''}</div>
    const selectedUnitIdsLookup: {[key: string]: boolean} = (selection.selectedUnitIds || []).reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
    return (
        <PlotGrid
            sorting={props.sorting}
            selections={selectedUnitIdsLookup}
            onUnitClicked={props.onUnitClicked}
            dataFunctionName={'createjob_fetch_average_waveform_plot_data'}
            dataFunctionArgsCallback={(unitId: number) => ({
                sorting_object: props.sorting.sortingObject,
                recording_object: props.recording.recordingObject,
                unit_id: unitId
            })}
            // use default boxSize
            plotComponent={AverageWaveformPlotNew}
            plotComponentArgsCallback={(unitId: number) => ({
                id: 'plot-'+unitId
            })}
            newHitherJobMethod={true}
            calculationPool={averageWaveformsCalculationPool}
            hither={props.hither}
        />
    );
}

export default AverageWaveformsNew
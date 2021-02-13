import React, { useCallback } from 'react';
import PlotGrid from '../../common/PlotGrid';
import { createCalculationPool } from '../../labbox/hither';
import { SortingViewProps } from "../../pluginInterface";
import AverageWaveformPlotNew from './AverageWaveformPlotNew';

const averageWaveformsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const AverageWaveformsNew: React.FunctionComponent<SortingViewProps> = (props) => {
    const { selection, selectionDispatch } = props
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
    const handleUnitClicked = useCallback((unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => {
        selectionDispatch({
            type: 'UnitClicked',
            unitId,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey
        })
    }, [selectionDispatch])
    return (
        <PlotGrid
            sorting={props.sorting}
            selections={selectedUnitIdsLookup}
            onUnitClicked={handleUnitClicked}
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
            calculationPool={averageWaveformsCalculationPool}
        />
    );
}

export default AverageWaveformsNew
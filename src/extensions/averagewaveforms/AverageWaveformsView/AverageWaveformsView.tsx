import React, { FunctionComponent } from 'react';
import createCalculationPool from '../../common/createCalculationPool';
import PlotGrid from '../../common/PlotGrid';
import { SortingViewProps } from "../../extensionInterface";
import AverageWaveformView from './AverageWaveformView';

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformsView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, onUnitClicked, hither}) => {
    const selectedUnitIdsLookup: {[key: string]: boolean} = (selection.selectedUnitIds || []).reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
    return (
        <PlotGrid
            sorting={sorting}
            selections={selectedUnitIdsLookup}
            onUnitClicked={onUnitClicked}
            dataFunctionName={'createjob_fetch_average_waveform_2'}
            dataFunctionArgsCallback={(unitId: number) => ({
                sorting_object: sorting.sortingObject,
                recording_object: recording.recordingObject,
                unit_id: unitId
            })}
            // use default boxSize
            boxSize={{width: 300, height: 300}}
            plotComponent={AverageWaveformView}
            plotComponentArgsCallback={(unitId: number) => ({
                id: 'plot-'+unitId
            })}
            calculationPool={calculationPool}
            hither={hither}
        />
    );
}

export default AverageWaveformsView
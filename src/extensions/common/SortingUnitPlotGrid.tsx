import { Button, Grid } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
import { Sorting, SortingInfo, SortingSelection, SortingSelectionDispatch } from '../extensionInterface';
import { useSortingInfo } from './getRecordingInfo';
=======
import { useSortingInfo } from '../../actions/getRecordingInfo';
import { Sorting, SortingSelection, SortingSelectionDispatch } from '../extensionInterface';
>>>>>>> workspace view and simplified state flow

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    unitComponent: (unitId: number) => React.ReactElement
}

const SortingUnitPlotGrid: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch, unitComponent }) => {
    const maxUnitsVisibleIncrement = 60;
    const [maxUnitsVisible, setMaxUnitsVisible] = useState(30);
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
    const sortingInfo: SortingInfo | undefined = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
=======
    const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
>>>>>>> workspace view and simplified state flow

    const visibleUnitIds = selection.visibleUnitIds
    let unit_ids: number[] = (sortingInfo ? sortingInfo.unit_ids : []).filter(uid => ((!visibleUnitIds) || (visibleUnitIds.includes(uid))));
    let showExpandButton = false;
    if (unit_ids.length > maxUnitsVisible) {
        unit_ids = unit_ids.slice(0, maxUnitsVisible);
        showExpandButton = true;
    }

    // useCheckForChanges('SortingUnitPlotGrid', {sorting, selection, selectionDispatch, unitComponent})

    const handleUnitClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const unitId = Number(event.currentTarget.dataset.unitId)
        selectionDispatch({type: 'UnitClicked', unitId, ctrlKey: event.ctrlKey, shiftKey: event.shiftKey})
    }, [selectionDispatch])

    return (
        <Grid container>
            {
                unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <div className='plotWrapperStyle'
                        >
                            <div
                                data-unit-id={unitId}
                                className={selection.selectedUnitIds?.includes(unitId) ? 'plotSelectedStyle' : 'plotUnselectedStyle'}
                                onClick={handleUnitClick}
                            >
                                <div className='plotUnitLabel'>
                                    <div>Unit {unitId}</div>
                                </div>
                                {
                                    unitComponent(unitId)
                                }
                                {/* <ClientSidePlot
                                    dataFunctionName={dataFunctionName}
                                    dataFunctionArgs={dataFunctionArgsCallback(unitId)}
                                    boxSize={boxSize}
                                    PlotComponent={plotComponent}
                                    plotComponentArgs={plotComponentArgsCallback(unitId)}
                                    plotComponentProps={plotComponentPropsCallback ? plotComponentPropsCallback(unitId): undefined}
                                    calculationPool={calculationPool}
                                    title=""
                                    hither={hither}
                                /> */}
                            </div>
                        </div>
                    </Grid>
                ))
            }
            {
                showExpandButton && (
                    <div className='plotWrapperStyle'>
                        <div className='plotWrapperStyleButton'>
                            <Button onClick={() => {setMaxUnitsVisible(maxUnitsVisible + maxUnitsVisibleIncrement)}}>Show more units</Button>
                        </div>
                    </div>
                    
                )
            }
        </Grid>
    );
}

export default SortingUnitPlotGrid
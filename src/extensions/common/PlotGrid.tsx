import { Button, Grid } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import { CalculationPool, HitherContext, Sorting } from '../extensionInterface';
import ClientSidePlot from './ClientSidePlot';

const isSelected = (query: string, selections: {[key: string]: boolean} = {}) => (selections[query] ? true : false);

interface Props {
    sorting: Sorting
    onUnitClicked: (unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => void
    selections: {[key: string]: boolean}
    focus: number | null
    dataFunctionName: string
    dataFunctionArgsCallback: any
    boxSize?: { width: number, height: number}
    plotComponent: React.FunctionComponent<any>
    plotComponentArgsCallback: any
    newHitherJobMethod: boolean
    useJobCache?: boolean
    calculationPool: CalculationPool | undefined
    hither: HitherContext
}

const PlotGrid: FunctionComponent<Props> = ({ sorting, onUnitClicked, selections, focus,
    dataFunctionName, dataFunctionArgsCallback, // fix this
    boxSize = { width: 200, height: 200},
    plotComponent, plotComponentArgsCallback, // fix this
    newHitherJobMethod = false,
    useJobCache = false,
    calculationPool = undefined,
    hither
}) => {
        const maxUnitsVisibleIncrement = 60;
        const [maxUnitsVisible, setMaxUnitsVisible] = useState(30);

        let unit_ids: number[] = sorting.sortingInfo ? sorting.sortingInfo.unit_ids : [];
        let showExpandButton = false;
        if (unit_ids.length > maxUnitsVisible) {
            unit_ids = unit_ids.slice(0, maxUnitsVisible);
            showExpandButton = true;
        }

        return (
            <Grid container>
                {
                    unit_ids.map(unitId => (
                        <Grid key={unitId} item>
                            <div className='plotWrapperStyle'
                            >
                                <div
                                    className={isSelected(unitId + '', selections)
                                        ? (unitId === focus)
                                            ? 'plotFocusedStyle'
                                            : 'plotSelectedStyle'
                                        : 'unselectedStyle'}
                                    onClick={(event) => onUnitClicked(unitId, event)}
                                >
                                    <div className='plotUnitLabel'>
                                        <div>Unit {unitId}</div>
                                    </div>
                                    <ClientSidePlot
                                        dataFunctionName={dataFunctionName}
                                        dataFunctionArgs={dataFunctionArgsCallback(unitId)}
                                        boxSize={boxSize}
                                        plotComponent={plotComponent}
                                        plotComponentArgs={plotComponentArgsCallback(unitId)}
                                        useJobCache={useJobCache}
                                        newHitherJobMethod={newHitherJobMethod}
                                        calculationPool={calculationPool}
                                        title=""
                                        hither={hither}
                                    />
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


export default PlotGrid;
import { Button, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import ClientSidePlot from './ClientSidePlot';

const isSelected = (query, selections = {}) => (selections[query]);

const PlotGrid = ({ sorting, onUnitClicked, selections, focus,
    dataFunctionName, dataFunctionArgsCallback, // fix this
    boxSize = { width: 200, height: 200},
    plotComponent, plotComponentArgsCallback, // fix this
    newHitherJobMethod = false,
    useJobCache = false,
    jobHandlerName = null,
    calculationPool = null
}) => {
        const maxUnitsVisibleIncrement = 60;
        const [maxUnitsVisible, setMaxUnitsVisible] = useState(30);

        let unit_ids = sorting.sortingInfo.unit_ids;
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
                                    className={isSelected(unitId, selections)
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
                                        jobHandlerName={jobHandlerName}
                                        calculationPool={calculationPool}
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
import React from 'react';
import { Grid } from '@material-ui/core';
import ClientSidePlot from './ClientSidePlot';

const isSelected = (query, selections = {}) => (selections[query]);

const PlotGrid = ({ sorting, onUnitClicked, selections, focus,
    dataFunctionName, dataFunctionArgsCallback = () => {},
    boxSize = { width: 200, height: 200},
    plotComponent, plotComponentArgsCallback = () => {},
    newHitherJobMethod = false,
    useJobCache = false,
    jobHandlerName = null,
    calculationPool = null
}) => {
        return (
            <Grid container>
                {
                    sorting.sortingInfo.unit_ids.map(unitId => (
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
            </Grid>
        );
}


export default PlotGrid;
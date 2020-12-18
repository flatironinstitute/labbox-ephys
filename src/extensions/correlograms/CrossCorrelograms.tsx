import { Button, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { SizeMeProps, withSize } from 'react-sizeme';
import ClientSidePlot from '../common/ClientSidePlot';
import createCalculationPool from '../common/createCalculationPool';
import { SortingViewProps } from '../extensionInterface';
import Correlogram_rv from './Correlogram_ReactVis';

const crossCorrelogramsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const CrossCorrelograms: React.FunctionComponent<SortingViewProps & SizeMeProps> = ({ size, sorting, recording, selection, hither }) => {
    const plotMargin = 2; // in pixels
    const [chosenPlots, setChosenPlots] = useState<number[]>([]);
    const myId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const handleUpdateChosenPlots = () => {
        setChosenPlots((selection.selectedUnitIds || [])
            .filter(x => !isNaN(x)));
    };

    const n = chosenPlots.length

    const width = size.width
    if (!width) return <div>No width</div>

    const computeLayout = (marginInPx: number, maxSize: number = 400) => {
        const N = n || 1 // don't want to divide by zero
        // note adjacent margins will collapse, and we don't care about vertical length
        // (the user can scroll). So: horizontal space taken is:
        // width = n*plotWidth + 2*margin (2 outer margins) + (n-1)*margin (gutters between plots)
        // width = margin*(n+1) + plotWidth * n
        // Solve for plotWidth = (width - margin*(n+1))/n.
        // And we can't have fractional pixels, so round down.
        const plotWidth = Math.min(maxSize, Math.floor((width - marginInPx*(N + 1))/N));
        return plotWidth;
    }

    // pairs are objects of the form '{ xkey: unitId, ykey: unitId }'
    // This function should return a list of the pairs, in row-major order.
    const makePairs = () => {
        return chosenPlots.reduce((list: {xkey: number, ykey: number}[], yItem) => {
            const a = chosenPlots.map((xItem) => {
                return {xkey: xItem, ykey: yItem}
            })
            return list.concat(a)
        }, []);
    }

    const pairs = makePairs();
    const plotWidth = computeLayout(plotMargin);
    const rowBounds = [...Array(pairs.length).keys()].filter(i => i % n === 0);

    if (!plotWidth) return <div>No plot width</div>

    const renderRow = ( pairs: {xkey: number, ykey: number}[], plotWidth: number ) => {
        return (
            <Grid key={'range-'+pairs[0].ykey+'-to-'+pairs[pairs.length -1].ykey}>
                {
                    pairs.map((pair) => (
                        <Grid key={pair.xkey + '-' + pair.ykey + '-' + plotWidth} item
                                style={{ 'paddingBottom': '25px',
                                    'marginBottom': '50px'}}>
                            <div
                            >
                                <ClientSidePlot
                                    dataFunctionName='fetch_correlogram_plot_data'
                                    dataFunctionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        unit_x: pair.xkey,
                                        unit_y: pair.ykey
                                    }}
                                    boxSize={{
                                        width: plotWidth,
                                        height: plotWidth
                                    }}
                                    title={pair.xkey + " vs " + pair.ykey}
                                    PlotComponent={Correlogram_rv}
                                    plotComponentArgs={{id: pair.xkey+'-'+pair.ykey}}
                                    useJobCache={true}
                                    requiredFiles={sorting.sortingObject}
                                    calculationPool={crossCorrelogramsCalculationPool}
                                    newHitherJobMethod={false}
                                    hither={hither}
                                />
                            </div>
                        </Grid>
                    ))
                }
            </Grid>
        );
    }

    if ((selection.selectedUnitIds || []).length === 0) {
        return <div style={{'width': '100%'}} >First select one or more units</div>
    }

    return (
        <div style={{'width': '100%'}} id={myId}>
            <Button onClick={() => handleUpdateChosenPlots()}>Update</Button>
            <Grid container>
                {
                    rowBounds.map((start) => renderRow(pairs.slice(start, start + n), plotWidth))
                }
            </Grid>
        </div>
    );
}

export default withSize()(CrossCorrelograms)
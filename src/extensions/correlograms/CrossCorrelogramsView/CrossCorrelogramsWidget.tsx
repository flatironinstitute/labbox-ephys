import { Grid } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import ClientSidePlot from '../../common/ClientSidePlot';
import createCalculationPool from '../../common/createCalculationPool';
import { Sorting } from '../../extensionInterface';
import Correlogram_rv from '../Correlogram_ReactVis';

type Props = {
    sorting: Sorting
    unitIds: number[]
    width: number
    height: number
}

const crossCorrelogramsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const CrossCorrelogramsWidget: FunctionComponent<Props> = ({ sorting, unitIds, width, height }) => {
    const plotMargin = 2 // in pixels
    const n = unitIds.length
    const N = n || 1 // don't want to divide by zero

    const computeLayout = (marginInPx: number, maxSize: number = 400, minSize: number=200) => {
        // note adjacent margins will collapse, and we don't care about vertical length
        // (the user can scroll). So: horizontal space taken is:
        // width = n*plotWidth + 2*margin (2 outer margins) + (n-1)*margin (gutters between plots)
        // width = margin*(n+1) + plotWidth * n
        // Solve for plotWidth = (width - margin*(n+1))/n.
        // And we can't have fractional pixels, so round down.
        const xPlotWidth = Math.floor((width - marginInPx*(N + 1))/N)
        const yPlotWidth = Math.floor((height - marginInPx*(N + 1))/N)
        return Math.max(minSize, Math.min(maxSize, Math.min(xPlotWidth, yPlotWidth)))
    }
    // pairs are objects of the form '{ xkey: unitId, ykey: unitId }'
    // This function should return a list of the pairs, in row-major order.
    const makePairs = (): {xkey: number, ykey: number}[] => {
        return unitIds.reduce((list: {xkey: number, ykey: number}[], yItem) => {
            const a = unitIds.map((xItem) => {
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
                        <Grid key={pair.xkey + '-' + pair.ykey + '-' + plotWidth} item>
                            <div
                            >
                                <ClientSidePlot
                                    dataFunctionName='createjob_fetch_correlogram_plot_data'
                                    dataFunctionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        unit_x: pair.xkey,
                                        unit_y: pair.ykey
                                    }}
                                    boxSize={{
                                        width: plotWidth,
                                        height: plotWidth - 35
                                    }}
                                    title={pair.xkey + " vs " + pair.ykey}
                                    PlotComponent={Correlogram_rv}
                                    plotComponentArgs={{id: pair.xkey+'-'+pair.ykey}}
                                    calculationPool={crossCorrelogramsCalculationPool}
                                />
                            </div>
                        </Grid>
                    ))
                }
            </Grid>
        );
    }

    if (unitIds.length === 0) {
        return <div style={{width, height, position: 'absolute'}} >First select one or more units</div>
    }

    return (
        <div style={{width, height, position: 'absolute'}}>
            <Grid container spacing={0}>
                {
                    rowBounds.map((start) => renderRow(pairs.slice(start, start + n), plotWidth))
                }
            </Grid>
        </div>
    )
}

export default CrossCorrelogramsWidget
import React, { useState } from 'react';
import { withSize } from 'react-sizeme';
import ClientSidePlot from '../../components/ClientSidePlot';
import { Grid } from '@material-ui/core';
import { Button } from '@material-ui/core';
import Correlogram_rv from './Correlogram_ReactVis';
import sampleSortingViewProps from '../common/sampleSortingViewProps';


const CrossCorrelograms = ({ size, sorting, recording, selectedUnitIds }) => {
    const filteredIds = Object.fromEntries(
        Object.keys(selectedUnitIds).filter(k => selectedUnitIds[k])
        .filter(id => sorting.sortingInfo.unit_ids.includes(parseInt(id)))
        .map(id => [id, true]));

    const plotMargin = 2; // in pixels
    const [chosenPlots, setChosenPlots] = useState([]);
    const myId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const handleUpdateChosenPlots = () => {
        setChosenPlots(Object.keys(filteredIds)
            .map((x) => parseInt(x))
            .filter(x => !isNaN(x)));
    };

    const n = chosenPlots.length || 0;

    const computeLayout = (marginInPx, maxSize = 800) => {
        // we need to fit a square of side length n elements into the wrapper's width.
        if (n < 1) return;
        // note adjacent margins will collapse, and we don't care about vertical length
        // (the user can scroll). So: horizontal space taken is:
        // width = n*plotWidth + 2*margin (2 outer margins) + (n-1)*margin (gutters between plots)
        // width = margin*(n+1) + plotWidth * n
        // Solve for plotWidth = (width - margin*(n+1))/n.
        // And we can't have fractional pixels, so round down.
        const plotWidth = Math.min(maxSize, Math.floor((size.width - marginInPx*(n + 1))/n));
        return plotWidth;
    }

    // pairs are objects of the form '{ xkey: unitId, ykey: unitId }'
    // This function should return a list of the pairs, in row-major order.
    const makePairs = () => {
        return chosenPlots.reduce((list, yItem) => {
            return list.concat(chosenPlots.map((xItem) => {
                return {xkey: xItem, ykey: yItem}
            }))
        }, []);
    }

    const pairs = makePairs();
    const plotWidth = computeLayout(plotMargin);
    const rowBounds = [...Array(pairs.length).keys()].filter(i => i % n === 0);

    const renderRow = ( pairs, plotWidth ) => {
        return (
            <Grid key={'range-'+pairs[0].xkey+'-to-'+pairs[pairs.length -1].xkey}>
                {
                    pairs.map((pair) => (
                        <Grid key={pair.xkey + '-' + pair.ykey + '-' + plotWidth} item
                                style={{ 'paddingBottom': '25px',
                                    'marginBottom': '50px'}}>
                            <div
                            >
                                <div className='plotUnitLabel'>
                                    <div>{pair.xkey + ' vs ' + pair.ykey}</div>
                                </div>
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
                                    plotComponent={Correlogram_rv}
                                    plotComponentArgs={{id: pair.xkey+'-'+pair.ykey}}
                                    useJobCache={true}
                                    jobHandlerName="partition1"
                                    requiredFiles={sorting.sortingObject}
                                />
                            </div>
                        </Grid>
                    ))
                }
            </Grid>
        );
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

const label = 'Cross-Correlograms'

CrossCorrelograms.sortingViewPlugin = {
    label: label
}

CrossCorrelograms.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

// export default CrossCorrelograms;
const exportedComponent = withSize()(CrossCorrelograms);
exportedComponent.sortingViewPlugin = {
    label: label
}
exportedComponent.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default exportedComponent;
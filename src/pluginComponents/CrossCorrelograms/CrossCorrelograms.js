import React, { useState } from 'react';
import { withSize } from 'react-sizeme';
// import sizeMe from 'react-sizeme';
import MatplotlibPlot from '../../components/MatplotlibPlot';
import { Grid } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { Box, CircularProgress } from '@material-ui/core'; // this should go away once we're doing actual plots
import sampleSortingViewProps from '../common/sampleSortingViewProps';

const CrossCorrelograms = ({ size, sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    const plotMargin = 2; // in pixels
    const [chosenPlots, setChosenPlots] = useState([]);
    const myId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const handleUpdateChosenPlots = () => {
        setChosenPlots(sorting.sortingInfo.unit_ids.filter((key) => isSelected(key)));
    };

    const n = chosenPlots.length || 0;

    const computeLayout = (marginInPx, maxSize = 800) => {
        // we need to fit a square of side length n elements into the wrapper's width.
        if (n < 2) return;
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
        return chosenPlots.reduce((list, xItem) => {
            return list.concat(chosenPlots.map((yItem) => {
                return {xkey: xItem, ykey: yItem}
            }))
        }, []);
    }

    const pairs = makePairs();
    const plotWidth = computeLayout(plotMargin);
    const rowBounds = [...Array(pairs.length).keys()].filter(i => i % n === 0);

    const renderRow = ( pairs, plotWidth ) => {
        return (
            <Grid>
                {
                    pairs.map((pair) => (
                        <Grid key={pair.xkey + '-' + pair.ykey} item
                                style={{ 'paddingBottom': '25px',
                                    'marginBottom': '50px'}}>
                            <div
                            >
                                <div style={{ 'textAlign': 'center', 'fontWeight': 'bold' }}>
                                    <div>{pair.xkey + ' vs ' + pair.ykey}</div>
                                </div>
                                {/* <Box display="flex" width={plotWidth + "px"} height={plotWidth + 'px'}
                                >
                                    <CircularProgress />
                                </Box> */}
                                <MatplotlibPlot
                                    functionName='genplot_crosscorrelogram'
                                    functionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        x_unit_id: pair.xkey,
                                        y_unit_id: pair.ykey,
                                        plot_edge_size: (plotWidth/100)
                                    }}
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
            <Grid container>
                {
                    rowBounds.map((start) => renderRow(pairs.slice(start, start + n), plotWidth))
                }
            </Grid>
            <Button onClick={() => handleUpdateChosenPlots()}>Update selections</Button>
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
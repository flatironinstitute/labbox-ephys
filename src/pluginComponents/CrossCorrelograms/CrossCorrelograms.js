import React, { useState } from 'react';
import MatplotlibPlot from '../../components/MatplotlibPlot';
import { Grid } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { Box, CircularProgress } from '@material-ui/core'; // this should go away once we're doing actual plots
import sampleSortingViewProps from '../common/sampleSortingViewProps';

const CrossCorrelograms = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    const [chosenPlots, setChosenPlots] = useState([]);
    const myId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const handleUpdateChosenPlots = () => {
        setChosenPlots(sorting.sortingInfo.unit_ids.filter((key) => isSelected(key)));
    };

    const computeLayout = (frameId, marginInPx) => {
        const width = document.getElementById(frameId).offsetWidth;
        // we need to fit a square of side length n elements into the wrapper's width.
        const n = chosenPlots.length;
        if (n < 2) return;
        // note adjacent margins will collapse, and we don't care about vertical length
        // (the user can scroll). So: horizontal space taken is:
        // width = n*plotWidth + 2*margin (2 outer margins) + (n-1)*margin (gutters between plots)
        // width = margin*(n+1) + plotWidth * n
        // Solve for plotWidth = (width - margin*(n+1))/n.
        // And we can't have fractional pixels, so round down.
        const plotWidth = Math.floor((width - marginInPx*(n + 1))/n);

        return plotWidth;
    }

    const makePairs = () => {
        return chosenPlots.reduce((list, xItem) => {
            return list.concat(chosenPlots.map((yItem) => {
                return {xkey: xItem, ykey: yItem}
            }))
        }, []);
    }

    return (
        <div style={{'width': '100%'}} id={myId}>
            <Grid container>
                {
                    sorting.sortingInfo.unit_ids.map(unitId => (
                        <Grid key={unitId} item>
                            <div
                            >
                                <div style={{ 'textAlign': 'center' }}>
                                    <div></div>
                                </div>
                                <Box display="flex" width={computeLayout(myId, 1)}
                                >
                                    <CircularProgress />
                                </Box>
                            </div>
                        </Grid>
                    ))
                }
            </Grid>
            <Button onClick={() => handleUpdateChosenPlots()}>Update selections</Button>
            <Button onClick={() => {alert(`Pairs: ${JSON.stringify(makePairs())}`)}}>Show Layout</Button>
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

export default CrossCorrelograms
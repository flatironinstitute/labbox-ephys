import React, { useState } from 'react';
import { withSize } from 'react-sizeme';
import CalculationPool from '../common/CalculationPool';
import { Grid, Button } from '@material-ui/core';
import IndividualUnit from './IndividualUnit';

const individualUnitsCalculationPool = new CalculationPool({maxSimultaneous: 6});

const IndividualUnits = ({ size, sorting, recording, selectedUnitIds }) => {
    const maxUnitsVisibleIncrement = 4;
    const [maxUnitsVisible, setMaxUnitsVisible] = useState(4);

    let selectedUnitIdsArray =
        Object.keys(selectedUnitIds).filter(k => selectedUnitIds[k])
        .filter(id => sorting.sortingInfo.unit_ids.includes(parseInt(id)))
        .map(id => parseInt(id));
    
    let showExpandButton = false;
    if (selectedUnitIdsArray.length > maxUnitsVisible) {
        selectedUnitIdsArray = selectedUnitIdsArray.slice(0, maxUnitsVisible);
        showExpandButton = true;
    }

    // const computeLayout = (marginInPx, maxSize = 800) => {
    //     // we need to fit a square of side length n elements into the wrapper's width.
    //     if (n < 1) return;
    //     // note adjacent margins will collapse, and we don't care about vertical length
    //     // (the user can scroll). So: horizontal space taken is:
    //     // width = n*plotWidth + 2*margin (2 outer margins) + (n-1)*margin (gutters between plots)
    //     // width = margin*(n+1) + plotWidth * n
    //     // Solve for plotWidth = (width - margin*(n+1))/n.
    //     // And we can't have fractional pixels, so round down.
    //     const plotWidth = Math.min(maxSize, Math.floor((size.width - marginInPx*(n + 1))/n));
    //     return plotWidth;
    // }

    return (
        <Grid container direction="column">
            {
                selectedUnitIdsArray.map(id => (
                    <Grid item key={id}>
                        <IndividualUnit
                            sorting={sorting}
                            recording={recording}
                            unitId={id}
                            calculationPool={individualUnitsCalculationPool}
                            width={size.width}
                        />
                    </Grid>
                ))
            }
            {
                showExpandButton ? (
                    <Grid item key="expand">
                        <Button onClick={() => {setMaxUnitsVisible(maxUnitsVisible + maxUnitsVisibleIncrement)}}>Show more selected units</Button>
                    </Grid>
                ) : (
                    (selectedUnitIdsArray.length === 0) &&
                    <div>Select one or more units</div>
                )
            }
        </Grid>
    );
}

const label = 'Individual units'

// export default CrossCorrelograms;
const exportedComponent = withSize()(IndividualUnits);
exportedComponent.sortingViewPlugin = {
    label: label
}

export default exportedComponent;
import { Button, Grid } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import { createCalculationPool } from '../../common/hither';
import { SortingViewProps } from '../../extensionInterface';
import IndividualUnit from './IndividualUnit';

const individualUnitsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const IndividualUnits: FunctionComponent<SortingViewProps & SizeMeProps> = ({ size, sorting, recording, selection, plugins }) => {
    const maxUnitsVisibleIncrement = 4;
    const [maxUnitsVisible, setMaxUnitsVisible] = useState(4);
    // const { workspaceName, feedUri, readOnly } = workspaceInfo || {};
    const { sortingInfo } = sorting
    if (!sortingInfo) return <div>No sorting info</div>

    let selectedUnitIdsArray = selection.selectedUnitIds || []
    
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

    const width = size.width
    if (!width) return <div>No width</div>

    return (
        <Grid container direction="column">
            {
                selectedUnitIdsArray.map(id => (
                    <Grid item key={id}>
                        <h3>Unit {id}</h3>
                        <IndividualUnit
                            sorting={sorting}
                            recording={recording}
                            unitId={id}
                            calculationPool={individualUnitsCalculationPool}
                            width={width}
                            sortingInfo={sortingInfo}
                            plugins={plugins}
                        />
                        {/* <Link to={`/${workspaceName}/sortingUnit/${sorting.sortingId}/${id}/${getPathQuery({feedUri})}`}>
                            More details for unit {id}
                        </Link> */}
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

export default sizeMe()(IndividualUnits)
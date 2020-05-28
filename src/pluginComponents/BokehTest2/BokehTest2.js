import React, { Fragment } from 'react'
import BokehPlot from '../../components/BokehPlot';
import { Grid } from '@material-ui/core';

const BokehTest2 = () => {
    return (
        <Grid container>
            <Grid item>
                <BokehPlot
                    functionName="bokeh_test_2"
                    functionArgs={{
                    }}
                />
            </Grid>
            <Grid item>
                <BokehPlot
                    functionName="bokeh_test_2"
                    functionArgs={{
                    }}
                />
            </Grid>            
        </Grid>
    );
}

BokehTest2.prototypeViewPlugin = {
    label: 'Bokeh test 2'
}

export default BokehTest2
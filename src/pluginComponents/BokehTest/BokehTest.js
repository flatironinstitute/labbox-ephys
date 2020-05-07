import React from 'react'
import BokehPlot from '../../components/BokehPlot';

const BokehTest = ({ sortingPath, recordingPath }) => {
    return (
        <BokehPlot
            functionName="bokeh_test"
            functionArgs={{
            }}
        />
    );
}

BokehTest.prototypeViewPlugin = {
    label: 'Bokeh test'
}

export default BokehTest
import React from 'react'
import MatplotlibPlot from '../../components/MatplotlibPlot';

const MatplotlibTest = () => {
    return (
        <MatplotlibPlot
            functionName="test_mpl"
            functionArgs={{
            }}
        />
    );
}

MatplotlibTest.prototypeViewPlugin = {
    label: 'Matplotlib test'
}

export default MatplotlibTest
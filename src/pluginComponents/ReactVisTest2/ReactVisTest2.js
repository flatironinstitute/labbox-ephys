import React, { useEffect, useState } from 'react'
import { XYPlot, LineMarkSeries } from 'react-vis';
import { sleep } from '../../actions';
import { createHitherJob } from '../../hither';

const ReactVisTest2 = () => {
    const [calculationStatus, setCalculationStatus] = useState('pending')
    const [calculationError, setCalculationError] = useState(null);
    const [plotData, setPlotData] = useState(null);

    const functionName = 'react_vis_test_2';
    const functionArgs = {a: 3};

    const effect = async () => {
        if (calculationStatus === 'pending') {
            setCalculationStatus('running');
            let plotData;
            try {
                await sleep(50);
                plotData = await createHitherJob(
                    functionName,
                    functionArgs,
                    { wait: true, useClientCache: true }
                )
            }
            catch (err) {
                console.error(err);
                setCalculationError(err.message);
                setCalculationStatus('error');
                return;
            }
            setPlotData(plotData);
            setCalculationStatus('finished');
        }
    }
    useEffect(() => { effect(); })

    if (calculationStatus === 'pending') {
        return <div>Calculation pending...</div>;
    }
    else if (calculationStatus === 'running') {
        return <div>Calculation pending...</div>;
    }
    else if (calculationStatus === 'error') {
        return <div>Error in calculation: <pre>{calculationError}</pre></div>;
    }
    else if (calculationStatus === 'finished') {
        return (
            <ThePlot plotData={plotData} />
        );
    }
    else {
        return <div>Unexpected calculation status: {calculationStatus}</div>
    }
}

const ThePlot = ({plotData}) => {
    return (
        <div className="App">
            <XYPlot height={300} width={300}>
                <LineMarkSeries data={plotData} />
            </XYPlot>
        </div>
    );
}

ReactVisTest2.prototypeViewPlugin = {
    label: 'React vis test 2'
}

export default ReactVisTest2
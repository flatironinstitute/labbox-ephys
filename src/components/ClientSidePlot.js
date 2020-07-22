import React, { useState, useEffect } from 'react';
import { sleep } from '../actions';
import { createHitherJob } from '../hither';
import { Box, CircularProgress } from '@material-ui/core';

const ClientSidePlot = ({ dataFunctionName, dataFunctionArgs,
                            boxSize = {width: 200, height: 200},
                            plotComponent, plotComponentArgs }) => {
    const [calculationStatus, setCalculationStatus] = useState('pending');
    const [calculationError, setCalculationError] = useState(null);
    const [plotData, setPlotData] = useState(null);

    const effect = async () => {
        if (calculationStatus === 'pending') {
            setCalculationStatus('running');
            let plot_data;
            try {
                setCalculationStatus('calculating');
                await sleep(50);
                plot_data = await createHitherJob(
                    dataFunctionName,
                    dataFunctionArgs,
                    {
                        auto_substitute_file_objects: true,
                        wait: true,
                        useClientCache: true
                    }
                )
            }
            catch (err) {
                console.error(err);
                setCalculationError(err.message);
                setCalculationStatus('error');
                return;
            }
            setPlotData(plot_data);
            setCalculationStatus('finished');
        }
    }
    useEffect(() => { effect(); });

    if (calculationStatus === 'pending' || calculationStatus === 'calculating' || calculationStatus === 'running') {
        return (
            <Box display="flex" width={boxSize.width} height={boxSize.height}
            >
                <Box m="auto">
                    <CircularProgress />
                </Box>
            </Box>
        );
    } else if (calculationStatus === 'error') {
        return (
            <div>Error in calculation: <pre>{calculationError}</pre></div>
        );
    } else if (calculationStatus === 'finished') {
        // TODO: Follow-up on distinction b/w this and <PlotComponent arg1={} arg2={} ... />
        return plotComponent(boxSize, plotData, plotComponentArgs);
    } else {
        return (
            <div>Unexpected calculation status: {calculationStatus}</div>
        );
    }
}

export default ClientSidePlot;
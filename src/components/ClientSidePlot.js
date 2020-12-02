import { Box, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { createHitherJob } from '../hither';

const ClientSidePlot = ({ dataFunctionName, dataFunctionArgs, useJobCache, newHitherJobMethod, requiredFiles,
    calculationPool,
    boxSize = { width: 200, height: 200 },
    plotComponent, plotComponentArgs, title }) => {
    const [calculationStatus, setCalculationStatus] = useState('waitingForVisible');
    const [calculationError, setCalculationError] = useState(null);
    const [plotData, setPlotData] = useState(null);
    const [visible, setVisible] = useState(false);

    const effect = async () => {
        if ((calculationStatus === 'waitingForVisible') && (visible)) {
            setCalculationStatus('waiting');
            const slot = calculationPool ? await calculationPool.requestSlot() : null;
            setCalculationStatus('calculating');
            let plot_data;
            try {
                plot_data = await createHitherJob(
                    dataFunctionName,
                    dataFunctionArgs,
                    {
                        auto_substitute_file_objects: true,
                        wait: true,
                        useClientCache: true,
                        hither_config: {
                            use_job_cache: useJobCache ? true : false
                        },
                        newHitherJobMethod: newHitherJobMethod ? true : false,
                        job_handler_name: 'default',
                        required_files: requiredFiles || {}
                    }
                )
            }
            catch (err) {
                console.error(err);
                setCalculationError(err.message);
                setCalculationStatus('error');
                return;
            }
            finally {
                slot && slot.complete();
            }
            setPlotData(plot_data);
            setCalculationStatus('finished');
        }
    }
    useEffect(() => { effect(); });

    if (calculationStatus === 'waitingForVisible') {
        return (
            <VisibilitySensor partialVisibility={true}>
                {({ isVisible }) => {
                    if (isVisible) {
                        // the setTimeout may be needed here to prevent a warning message
                        setTimeout(() => {
                            setVisible(true);
                        }, 0);
                    }
                    else {
                        // the setTimeout may be needed here to prevent a warning message
                        setTimeout(() => {
                            setVisible(false);
                        }, 0);
                    }
                    return (
                        <Box display="flex" width={boxSize.width} height={boxSize.height}
                        >
                            <Box m="auto">
                                <div>waiting-for-visible</div>
                            </Box>
                        </Box>
                    )
                }}
            </VisibilitySensor>
        );
    }
    if (calculationStatus === 'pending' || calculationStatus === 'waiting') {
        return (
            <Box display="flex" width={boxSize.width} height={boxSize.height}>
            </Box>
        );
    }
    else if (calculationStatus === 'calculating') {
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
            <Box display="flex" width={boxSize.width} height={boxSize.height}
            >
                <Box m="auto">
                    <div>Error in calculation: <pre>{calculationError}</pre></div>
                </Box>
            </Box>
        );
    } else if (calculationStatus === 'finished') {
        // TODO: Follow-up on distinction b/w this and <PlotComponent arg1={} arg2={} ... />
        return plotComponent({boxSize, plotData, argsObject: plotComponentArgs, title});
    } else {
        return (
            <div>Unexpected calculation status: {calculationStatus}</div>
        );
    }
}

export default ClientSidePlot;
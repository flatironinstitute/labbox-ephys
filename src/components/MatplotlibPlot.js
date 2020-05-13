import React, { useState, useEffect, useRef } from 'react'
import { createHitherJob } from '../hither'
import { sleep } from '../actions';
import { CircularProgress } from '@material-ui/core';
const mpld3 = require('./mpld3.v0.3.js');

const MatplotlibPlot = ({ functionName, functionArgs }) => {

    const [status, setStatus] = useState('')
    const [plotData, setPlotData] = useState(null);
    const plotRef = useRef(null);

    const effect = async () => {
        if (!status) {
            let plot_data;
            try {
                setStatus('calculating');
                await sleep(50)
                plot_data = await createHitherJob(
                    functionName,
                    functionArgs,
                    {
                        auto_substitute_file_objects: true,
                        wait: true
                    }
                )
            }
            catch (err) {
                console.error(err);
                setStatus('error');
                return;
            }
            setStatus('finished');
            setPlotData(plot_data);

        }
        else if ((status === 'finished') && (plotData)) {
            plotRef.current && mpld3.draw_figure(plotRef.current.id, plotData);
        }
    }
    useEffect(() => { effect(); })
    return (
        status === 'calculating' ? (
            <div><CircularProgress /></div>
        ) : (
            <div ref={plotRef} id={`matplotlib-${generateRandomAlphaId()}`} /> // note: it is important not to start id with a digit
        )
    );
}

function generateRandomAlphaId() {
    const num_chars = 10;
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default MatplotlibPlot;
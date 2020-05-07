import React, { useState, useEffect, useRef } from 'react'
import { createHitherJob, sleep } from '../actions';
import { CircularProgress } from '@material-ui/core';
const mpld3 = require('./mpld3.v0.3.js');

const MatplotlibPlot = ({ functionName, functionArgs }) => {

    const [status, setStatus] = useState('')
    const [plotData, setPlotData] = useState(null);
    const plotRef = useRef(null);

    const Bokeh = window.Bokeh;

    const effect = async () => {
        if (!status) {
            let plot_data;
            try {
                setStatus('calculating');
                await sleep(500)
                console.log(functionArgs);
                plot_data = await createHitherJob(
                    functionName,
                    functionArgs,
                    { wait: true }
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
            mpld3.draw_figure(plotRef.current.id, plotData);
        }
    }
    useEffect(() => { effect(); })
    return (
        status === 'calculating' ? (
            <div><CircularProgress /></div>
        ) : (
            <div ref={plotRef} id={generateRandomId()} />
        )
    );
}

function generateRandomId() {
    const num_chars = 10;
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default MatplotlibPlot;
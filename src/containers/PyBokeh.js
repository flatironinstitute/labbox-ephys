import React, { useState } from 'react'
import { useEffect } from "react";
import { createHitherJob } from '../actions';

const PyBokeh = ({ functionName, functionArgs }) => {
    const [status, setStatus] = useState('')
    const [plotData, setPlotData] = useState(null);

    const effect = async () => {
        if (!status) {
            const Bokeh = window.Bokeh;
            let plot_data;
            try {
                setStatus('calculate');
                plot_data = await createHitherJob(
                    functionName,
                    functionArgs,
                    { wait: true }
                )
            }
            catch(err) {
                console.error(err);
                setStatus('error');
                return;
            }
            setStatus('finished');
            setPlotData(plot_data);
            
        }
        else if ((status === 'finished') && (plotData)) {
            window.Bokeh.embed.embed_item(plotData);
        }
    }
    useEffect(() => { effect(); })
    return (
        <div id="test_bokeh" />
    );
}

export default PyBokeh;
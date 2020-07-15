import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

const Correlogram_nivo = (boxSize, plotData, argsObject = {id: 0}) => {
    const data = plotData[0].map((item, index) => {
        return { x: item.toFixed(3), y: plotData[1][index] };
    });

    console.log('Data-series:', data);

    return (
        <div style={{height: boxSize.height, width: boxSize.width, display: "flex"}}
            key={argsObject.id+'-wrapper'}>
             <ResponsiveBar
                 data={data}
                 indexBy="x"
                 keys={['y']}
                 margin={{ top: 20, right: 20, bottom: 45, left: 20 }}
                 padding={0}
                 axisBottom={{
                     // This is substantially less than ideal
                     // At the very least I'll probably want to replace this with a function to
                     // come up with the values, but... having to do this is not great
                     tickValues: ['-0.025',
                                  '-0.015',
                                  '-0.005',
                                  '0.005',
                                  '0.015',
                                  '0.025'],
                     tickSize: 5,
                     tickPadding: 5,
                     tickRotation: 0,
                     legend: 'dt (msec)',
                     legendPosition: 'middle',
                     legendOffset: 32
                 }}
                 axisLeft={{
                     tickSize: 5,
                     tickPadding: 5,
                     tickRotation: 0,
                 }}
                 labelSkipWidth={12}
                 labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]]}}
             />
        </div>
    )
}

export default Correlogram_nivo;
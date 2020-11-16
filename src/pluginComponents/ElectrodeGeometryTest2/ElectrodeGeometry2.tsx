import React from 'react';
// import ElectrodeLayoutPlot from '../AverageWaveformsNew/ElectrodeLayoutPlot';

interface ElectrodeGeometryProps {
    electrodes: ({
        label: string,
        x: number,
        y: number
    })[]
}

const ElectrodeGeometry = (props: ElectrodeGeometryProps) => {
    const { electrodes } = props;

    return ( <div></div>
        // <ElectrodeLayoutPlot
        //     width={200}
        //     height={200}
        //     data={{
        //         waveformYScaleFactor: 1,
        //         electrodes: electrodes.map(e => ({
        //             label: e.label,
        //             position: {x: e.x, y: e.y}
        //         }))
        //     }}
        //     plotElectrodes={true}
        // />
    )
    // return (
    //     <CanvasWidget
    //         key='canvas'
    //         layers={layers}
    //         width={200}
    //         height={200}
    //         onMouseMove={_handleMouseMove}
    //         onMousePress={_handleMousePress}
    //         onMouseRelease={_handleMouseRelease}
    //         onMouseDrag={_handleMouseDrag}
    //         onMouseDragRelease={_handleMouseDragRelease}
    //     />
    // )
}

export default ElectrodeGeometry
import React, { FunctionComponent, useMemo } from 'react';
import CanvasWidget from '../../common/CanvasWidget';
import { useLayer, useLayers } from '../../common/CanvasWidget/CanvasWidgetLayer';
import { RectangularRegion } from '../../common/CanvasWidget/Geometry';
import createClusterLayer, { ClusterLayerProps } from './clusterLayer';

type Props = {
    x: number[]
    y: number[]
    width: number
    height: number
    selectedIndex?: number
    onSelectedIndexChanged?: (i: number | undefined) => void
}

const IndividualClusterWidget: FunctionComponent<Props> = ({ x, y, width, height, selectedIndex, onSelectedIndexChanged }) => {
    const layerProps = useMemo((): ClusterLayerProps => {
        const xmin = Math.min(...x)
        const xmax = Math.max(...x)
        const ymin = Math.min(...y)
        const ymax = Math.max(...y)
        const rect: RectangularRegion = {xmin, xmax, ymin, ymax}
        return {
            x,
            y,
            rect,
            width,
            height,
            selectedIndex,
            onSelectedIndexChanged
        }
    }, [x, y, width, height, onSelectedIndexChanged, selectedIndex])
    const clusterLayer = useLayer(createClusterLayer, layerProps)
    const layers = useLayers([clusterLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width, height}}
        />
    )
}

export default IndividualClusterWidget
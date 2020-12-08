import React from 'react';
import CanvasWidget from './extensions/CanvasWidget';
import { CanvasPainter } from './extensions/CanvasWidget/CanvasPainter';
import { CanvasWidgetLayer, ClickEvent, ClickEventType, useCanvasWidgetLayer, useCanvasWidgetLayers } from './extensions/CanvasWidget/CanvasWidgetLayer';
import { TransformationMatrix, Vec2 } from './extensions/CanvasWidget/Geometry';

interface Raindrop {
  position: Vec2;
}

interface LayerProps {
  width: number
  height: number
  raindrops: Raindrop[]
  onKillRaindrop: (r: Raindrop) => void
}
interface LayerState {

}

const funcToTransform = (transformation: (p: Vec2) => Vec2): TransformationMatrix => {
  const p00 = transformation([0, 0])
  const p10 = transformation([1, 0])
  const p01 = transformation([0, 1])

  const M: TransformationMatrix = [
      [p10[0] - p00[0], p01[0] - p00[0], p00[0]],
      [p10[1] - p00[1], p01[1] - p00[1], p00[1]],
      [0, 0, 1]
  ]
  return M
}

const createLayer = () => {
  const radius = 0.1
  const onPaint = (painter: CanvasPainter, layerProps: LayerProps, state: LayerState) => {
      painter.fillRect({xmin: 0, xmax: 1, ymin: 0, ymax: 1}, {color: '#222222'})
      layerProps.raindrops.forEach(r => {
          painter.fillEllipse({
              xmin: r.position[0] - radius / 2, xmax: r.position[0] + radius / 2,
              ymin: r.position[1] - radius, ymax: r.position[1] + radius
          }, {color: 'lightblue'})
      })
  }
  const onPropsChange = (layer: CanvasWidgetLayer<LayerProps, LayerState>, layerProps: LayerProps) => {
      const W = layerProps.width
      const H = layerProps.height
      const scaleFactor = (W > H) ? H : W
      const M = funcToTransform((p: Vec2) => {
          return [p[0] * scaleFactor, H - p[1] * scaleFactor]
      })
      layer.setTransformMatrix(M)
      layer.scheduleRepaint()
      layer.setRefreshRate(40)
  }

  const distance = (p1: Vec2, p2: Vec2): number => {
      const deltaX = p1[0] - p2[0]
      const deltaY = p1[1] - p2[1]
      return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

  const handleClick = (event: ClickEvent, layer: CanvasWidgetLayer<LayerProps, LayerState>) => {
      if (event.type === ClickEventType.Press) {
          const pos = event.point
          const lp = layer.getProps()
          lp.raindrops.forEach(r => {
              if (distance(pos, r.position) < radius * 1.1) {
                  lp.onKillRaindrop(r)
              }
          })
      }
  }

  return new CanvasWidgetLayer<LayerProps, LayerState>(onPaint, onPropsChange, {}, {
      discreteMouseEventHandlers: [handleClick]
  })
}

interface Props {

}

const RaindropWidget: React.FunctionComponent<Props> = () => {
  const layer = useCanvasWidgetLayer(createLayer)
  const layers = useCanvasWidgetLayers([layer])
  return (
    <CanvasWidget
      layers={layers}
      layerProps={{
        width: 100,
        height: 100,
        raindrops: [{position: [0.5, 0.2]}, {position: [0.5, 0.7]}],
        onKillRaindrop: (r: Raindrop) => {console.log('---- click', r)}
      }}
    />
  )
}


export default RaindropWidget
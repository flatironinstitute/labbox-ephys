import { Brush, CanvasPainter, Font, PainterPath, Pen, TextAlignment } from "../jscommon/CanvasWidget/CanvasPainter";
import { BaseLayerProps } from "../jscommon/CanvasWidget/CanvasWidgetLayer";
import { RectangularRegion } from "../jscommon/CanvasWidget/Geometry";
import { TimeWidgetPanel } from "./TimeWidgetNew";

export interface TimeWidgetLayerProps extends BaseLayerProps {
    panels: TimeWidgetPanel[]
    currentTime: number | null
    timeRange: {min: number, max: number} | null
    samplerate: number
    margins: {left: number, right: number, top: number, bottom: number}
}

export interface Point2D {
    x: number,
    y: number
}

export interface CanvasPainterInterface {
    drawLine: (x1: number, y1: number, x2: number, y2: number, pen: Pen) => void
    drawText: (rect: RectangularRegion, alignment: TextAlignment, font: Font, pen: Pen, brush: Brush, txt: string) => void
    drawPath: (painterPath: PainterPath, pen: Pen) => void
}

export const transformPainter = (painter: CanvasPainter, transformation: (p: Point2D) => Point2D): CanvasPainterInterface => {
    const transformRect = (r: RectangularRegion): RectangularRegion => {
        const p1 = transformation({x: r.xmin, y: r.ymin})
        const p2 = transformation({x: r.xmax, y: r.ymax})
        return {
            xmin: p1.x,
            ymin: p1.y,
            xmax: p2.x,
            ymax: p2.y
        }
    }
    const transformPath = (p: PainterPath): PainterPath => {
        const p2 = new PainterPath()
        p2._setActions(p._actions().map(a => {
            const newXY = transformation({x: a.x, y: a.y})
            return {
                name: a.name,
                x: newXY.x,
                y: newXY.y
            }
        }))
        return p2
    }
    const drawLine = (x1: number, y1: number, x2: number, y2: number, pen: Pen) => {
        const p1 = {x: x1, y: y1}
        const p2 = {x: x2, y: y2}
        const p1a = transformation(p1)
        const p2a = transformation(p2)

        painter.drawLine(p1a.x, p1a.y, p2a.x, p2a.y, pen)
    }
    const drawText = (rect: RectangularRegion, alignment: TextAlignment, font: Font, pen: Pen, brush: Brush, txt: string) => {
        const rect2 = transformRect(rect)
        painter.drawText(rect2, alignment, font, pen, brush, txt)
    }
    const drawPath = (painterPath: PainterPath, pen: Pen) => {
        const path2 = transformPath(painterPath)
        painter.drawPath(path2, pen)
    }
    return {
        drawLine,
        drawText,
        drawPath
    }
}
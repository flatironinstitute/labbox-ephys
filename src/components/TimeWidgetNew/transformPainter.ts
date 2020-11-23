import { Brush, CanvasPainter, Font, PainterPath, Pen, TextAlignment } from "../jscommon/CanvasWidget/CanvasPainter"
import { getInverseTransformationMatrix, RectangularRegion, TransformationMatrix, transformPoint } from "../jscommon/CanvasWidget/Geometry"
import { Point2D } from "./TimeWidgetLayerProps"

export interface CanvasPainterInterface {
    drawLine: (x1: number, y1: number, x2: number, y2: number, pen: Pen) => void
    drawText: (rect: RectangularRegion, alignment: TextAlignment, font: Font, pen: Pen, brush: Brush, txt: string) => void
    drawPath: (painterPath: PainterPath, pen: Pen) => void
}

export const linearInverse = (transformation: (p: Point2D) => Point2D) => {
    const p00 = transformation({x: 0, y: 0})
    const p10 = transformation({x: 1, y: 0})
    const p01 = transformation({x: 0, y: 1})

    const M: TransformationMatrix = [
        [p10.x - p00.x, p01.x - p00.x, p00.x],
        [p10.y - p00.y, p01.y - p00.y, p00.y],
        [0, 0, 1]
    ]
    const Minv = getInverseTransformationMatrix(M)
    return (P: Point2D) => {
        const v = transformPoint(Minv, [P.x, P.y, 1])
        return {x: v[0], y: v[1]}
    }
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
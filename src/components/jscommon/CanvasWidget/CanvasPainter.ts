import { matrix, multiply } from 'mathjs'
import { isNumber, isString } from '../../../util/Utility'
import { getCenter, getHeight, getWidth, isVec2, isVec3, isVec4, RectangularRegion, TransformationMatrix, transformRect, Vec2, Vec3, Vec4 } from './Geometry'

interface TextAlignment {
    Horizontal: 'AlignLeft' | 'AlignCenter' | 'AlignRight'
    Vertical: 'AlignTop' | 'AlignCenter' | 'AlignBottom'
}
export const isTextAlignment = (x: any): x is TextAlignment => {
    switch (x.Horizontal) {
        case 'AlignLeft':
        case 'AlignCenter':
        case 'AlignRight':
            break
        default:
            return false
    }
    switch (x.Vertical) {
        case 'AlignTop':
        case 'AlignCenter':
        case 'AlignBottom':
            break
        default:
            return false
    }
    return true
}

interface TextAlignmentConfig {
    x: number
    y: number
    textAlign: 'left' | 'center' | 'right'
    textBaseline: 'bottom' | 'middle' | 'top'
}

const getTextAlignmentConfig = (rect: RectangularRegion, alignment: TextAlignment, t: TransformationMatrix): TextAlignmentConfig => {
    const rect2 = transformRect(t, rect)
    let x, y
    let textAlign = 'left'
    let textBaseline = 'bottom'
    switch (alignment.Horizontal) {
        case 'AlignLeft':
            x = rect2.xmin
            textAlign = 'left'
            break
        case 'AlignCenter':
            x = getCenter(rect2)[0]
            textAlign = 'center'
            break
        case 'AlignRight':
            x = rect2.xmax
            textAlign = 'right'
            break
        default: // can't happen
            throw new Error('Missing horizontal alignment in drawText: AlignLeft, AlignCenter, or AlignRight');
        }
    switch (alignment.Vertical) {
        case 'AlignBottom':
            y = rect2.ymin
            textBaseline = 'bottom'
            break
        case 'AlignCenter':
            y = getCenter(rect2)[1]
            textBaseline = 'middle'
            break
        case 'AlignTop':
            y = rect2.ymax
            textBaseline = 'top'
            break
        default: // can't happen
            throw new Error('Missing vertical alignment in drawText: AlignTop, AlignBottom, or AlignVCenter');
    }
    return {x: x, y: y, textAlign: textAlign, textBaseline: textBaseline} as TextAlignmentConfig
}


// html5 canvas context
export interface Context2D {
    clearRect: (x: number, y: number, W: number, H: number) => void,
    save: () => void,
    restore: () => void,
    clip: () => void,
    translate: (dx: number, dy: number) => void
    rotate: (theta: number) => void
    fillRect: (x: number, y: number, W: number, H: number) => void
    strokeRect: (x: number, y: number, W: number, H: number) => void
    beginPath: () => void
    moveTo: (x: number, y: number) => void
    lineTo: (x: number, y: number) => void
    stroke: () => void
    fill: () => void
    ellipse: (x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number) => void
    fillStyle: string
    strokeStyle: string
    lineWidth: number
    font: string
    textAlign: string
    textBaseline: string
    fillText: (txt: string, x: number, y: number) => void
}


type Color = 'black' | 'red' | 'blue' | 'transparent' | string
// TODO: Define additional colors w/ lookup table?

export interface Pen {
    color: Color,
    width?: number // N.B. as of right now this is ALWAYS IN PIXELS, regardless of coordinate system.
    // This is somewhat inconsistent, but a) it's probably what you actually want, and b) it'd be annoying to change.
}

export interface Font {
    "pixel-size": number,
    family: 'Arial' | string
}

export interface Brush {
    color: Color
}
export const isBrush = (x: any): x is Brush => {
    if (!x) return false
    if (typeof(x) !== 'object') return false
    if (!('color' in x)) return false
    return true
}


export class CanvasPainter {
    #exportingFigure: boolean = false
    #context2D: Context2D
    #fullDimensions: RectangularRegion
    #transformMatrix: TransformationMatrix
    constructor(context2d: Context2D, fullDimensions: RectangularRegion, transformMatrix: TransformationMatrix ) {
        this.#context2D = context2d
        this.#fullDimensions = fullDimensions
        this.#transformMatrix = transformMatrix
    }
    // TODO: Delete these default methods?
    getDefaultPen() {
        return { color: 'black' }
    }
    getDefaultFont() {
        return { "pixel-size": 12, family: 'Arial' }
    }
    getDefaultBrush() {
        return { color: 'black' }
    }
    createPainterPath() {
        return new PainterPath()
    }
    setExportingFigure(val: boolean) {
        this.#exportingFigure = val
    }
    exportingFigure() {
        return this.#exportingFigure
    }
    clear(): void {
        this.clearRect( { ...this.#fullDimensions } );
    }
    clearRect(rect: RectangularRegion) {
        this.fillRect(rect, {color: 'transparent'})
    }
    ctxSave() {
        this.#context2D.save();
    }
    ctxRestore() {
        this.#context2D.restore();
    }
    wipe(): void {
        const pr = transformRect(this.#transformMatrix, this.#fullDimensions)
        this.#context2D.clearRect(pr.xmin, pr.ymin, getWidth(pr), -getHeight(pr));
    }
    // TODO: REWRITE THIS ctxTranslate
    ctxTranslate(dx: number | Vec2, dy: number | undefined = undefined) {
        if (dy === undefined) {
            if (typeof dx === 'number') {
                throw Error('unexpected');
            }
            let tmp = dx;
            dx = tmp[0];
            dy = tmp[1];
            this.#context2D.translate(dx, dy);
        }
        if (typeof dx === 'object') {
            throw Error('Bad signature: dx object and dy not undef: ctxTranslate')
        }
        this.#context2D.translate(dx, dy);
    }
    ctxRotate(theta: number) {
        this.#context2D.rotate(theta)
    }
    fillRect(rect: RectangularRegion, brush: Brush) {
        const pr = transformRect(this.#transformMatrix, rect) // covert rect to pixelspace
        // console.log(`Transformed ${JSON.stringify(rect)} to ${JSON.stringify(pr)}`)
        // console.log(`Measure (pixelspace) width: ${getWidth(pr)}, height: ${getHeight(pr)}`)
        this.#context2D.save()
        applyBrush(this.#context2D, brush)
        // NOTE: Due to the pixelspace-conversion axis flip, the height should be negative.
        this.#context2D.fillRect(pr.xmin, pr.ymin, getWidth(pr), -getHeight(pr))
        this.#context2D.restore()
    }
    drawRect(rect: RectangularRegion, pen: Pen) {
        const pr = transformRect(this.#transformMatrix, rect) // convert rect to pixelspace
        this.#context2D.save()
        applyPen(this.#context2D, pen)
        // NOTE: Due to the pixelspace-conversion axis flip, the height should be negative.
        this.#context2D.strokeRect(pr.xmin, pr.ymin, getWidth(pr), -getHeight(pr))
        this.#context2D.restore()
    }
    getEllipseFromBoundingRect(boundingRect: RectangularRegion) {
        const r = transformRect(this.#transformMatrix, boundingRect)
        const center = getCenter(r)
        const W = Math.abs(getWidth(r))
        const H = Math.abs(getHeight(r))
        return {center, W, H}
    }
    fillEllipse(boundingRect: RectangularRegion, brush: Brush) {
        const {center, W, H} = {...this.getEllipseFromBoundingRect(boundingRect)}
        this.#context2D.save()
        this.#context2D.fillStyle = toColorStr(brush.color)
        this.#context2D.beginPath()
        this.#context2D.ellipse(center[0], center[1], W/2, H/2, 0, 0, 2 * Math.PI)
        this.#context2D.fill()
        this.#context2D.restore()
    }
    drawEllipse(boundingRect: RectangularRegion, pen: Pen) {
        const {center, W, H} = {...this.getEllipseFromBoundingRect(boundingRect)}
        this.#context2D.save()
        applyPen(this.#context2D, pen)
        // console.log(`Attempting to draw ellipse: ${center[0]} ${center[1]} ${W/2} ${H/2}`)
        this.#context2D.beginPath()
        this.#context2D.ellipse(center[0], center[1], W/2, H/2, 0, 0, 2 * Math.PI)
        this.#context2D.stroke()
        this.#context2D.restore()
    }
    drawPath(painterPath: PainterPath, pen: Pen) {
        this.#context2D.save()
        applyPen(this.#context2D, pen)
        painterPath._draw(this.#context2D, this.#transformMatrix)
        this.#context2D.restore()
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, pen: Pen) {
        const pPath = new PainterPath();
        pPath.moveTo(x1, y1);
        pPath.lineTo(x2, y2);
        this.drawPath(pPath, pen);
    }
    drawText(rect: RectangularRegion, alignment: TextAlignment, font: Font, pen: Pen, brush: Brush, txt: string) {
        const config = getTextAlignmentConfig(rect, alignment, this.#transformMatrix)
        this.#context2D.save()
        applyFont(this.#context2D, font)
        applyTextAlignment(this.#context2D, config)
        applyPen(this.#context2D, pen);
        applyBrush(this.#context2D, brush)
        this.#context2D.fillText(txt, config.x, config.y);
        this.#context2D.restore()
    }
    // in future we may want to implement this:
    // this.createImageData = function(W, H) {
    //     return ctx.getImageData(W, H);
    // }
    // this.putImageData = function(imagedata, x, y) {
    //     ctx.putImageData(imagedata, x, y);
    // }
    // this.drawImage = function(image, dx, dy) {
    //     ctx.drawImage(image, dx, dy);
    // }

    // TODO: implement markers
    // this.drawMarker = function(x, y, radius, shape, opts) {
    //     opts = opts || {};
    //     let pt = transformXY(x, y);
    //     _drawMarker(pt[0], pt[1], radius, shape, opts);
    // }
    // function _drawMarker(x, y, radius, shape, opts) {
    //     shape = shape || 'circle';
    //     let rect = [x-radius, y-radius, 2*radius, 2*radius];
    //     if (shape === 'circle') {
    //         if (opts.fill) {
    //             _fillEllipse(rect);
    //         }
    //         else {
    //             _drawEllipse(rect);
    //         }
    //     }
    //     else {
    //         console.error(`Unrecognized marker shape ${shape}`);
    //     }
    // }
    // this.fillMarker = function(x, y, radius, shape) {
    //     let pt = transformXY(x, y);
    //     _drawMarker(pt[0], pt[1], radius, shape, {fill: true});
    // }

}

interface PainterPathAction {
    name: 'moveTo' | 'lineTo'
    x: number
    y: number
}

export class PainterPath {
    #actions: PainterPathAction[] = []
    moveTo(x: number | Vec2, y: number | undefined = undefined): void {
        if (isVec2(x)) {
            return this.moveTo(x[0], x[1])
        }
        if (!isNumber(y)) throw Error('unexpected')
        this.#actions.push({
            name: 'moveTo',
            x,
            y
        })
    }
    lineTo(x: number | Vec2, y: number | undefined = undefined): void {
        if (isVec2(x)) {
            return this.lineTo(x[0], x[1])
        }
        if (!isNumber(y)) throw Error('unexpected')
        this.#actions.push({
            name: 'lineTo',
            x,
            y
        })
    }
    _draw(ctx: Context2D, tmatrix: TransformationMatrix) {
        ctx.beginPath();
        const actions = this._transformPathPoints(tmatrix)
        actions.forEach(a => {
            this._applyAction(ctx, a)
        })
        ctx.stroke();
    }
    _applyAction(ctx: Context2D, a: PainterPathAction) {
        if (a.name === 'moveTo') {
            ctx.moveTo(a.x, a.y);
        }
        else if (a.name === 'lineTo') {
            ctx.lineTo(a.x, a.y);
        }
    }
    _transformPathPoints(tmatrix: TransformationMatrix): PainterPathAction[] {
        const A = matrix(tmatrix)
        // if the paths were long it might be more efficient to make the vectors a wide matrix
        // ...but honestly it's probably so small a thing for what we do that it matters not
        return this.#actions.map((a) => {
            const x = matrix([a.x, a.y, 1])
            const b = multiply(A, x).toArray() as number[]
            return {...a, x: b[0], y: b[1] }
        })
    }
}

const toColorStr = (col: string | Vec3 | Vec4): string => {
    // TODO: Could do more validity checking here
    if (isString(col)) return col
    else if (isVec4(col)) {
        return (`rgba(${Math.floor(col[0])}, ${Math.floor(col[1])}, ${Math.floor(col[2])}, ${col[3]})`)
    } else if (isVec3(col)) {
        return (`rgb(${Math.floor(col[0])}, ${Math.floor(col[1])}, ${Math.floor(col[2])})`)
    } else {
        throw Error('unexpected')
    }
}

const applyPen = (ctx: Context2D, pen: Pen) => {
    const color = pen.color || 'black'
    const lineWidth = (isNumber(pen.width)) ? pen.width : 1
    ctx.strokeStyle = toColorStr(color)
    ctx.lineWidth = lineWidth || 1
}

const applyBrush = (ctx: Context2D, brush: Brush) => {
    const color = 'color' in brush ? brush.color : 'black'
    ctx.fillStyle = toColorStr(color)
}

const applyFont = (ctx: Context2D, font: Font) => {
    const size = font['pixel-size'] || '12'
    const face = font.family || 'Arial'
    ctx.font = `${size}px ${face}`
}

const applyTextAlignment = (ctx: Context2D, alignment: TextAlignmentConfig) => {
    ctx.textAlign = alignment.textAlign
    ctx.textBaseline = alignment.textBaseline
}


// todo: mouse handler
// export function MouseHandler() {
//     this.setElement = function (elmt) { m_element = elmt; };
//     this.onMousePress = function (handler) { m_handlers['press'].push(handler); };
//     this.onMouseRelease = function (handler) { m_handlers['release'].push(handler); };
//     this.onMouseMove = function (handler) { m_handlers['move'].push(handler); };
//     this.onMouseEnter = function (handler) { m_handlers['enter'].push(handler); };
//     this.onMouseLeave = function (handler) { m_handlers['leave'].push(handler); };
//     this.onMouseWheel = function (handler) { m_handlers['wheel'].push(handler); };
//     this.onMouseDrag = function (handler) { m_handlers['drag'].push(handler); };
//     this.onMouseDragRelease = function (handler) { m_handlers['drag_release'].push(handler); };

//     this.mouseDown = function (e) { report('press', mouse_event(e)); return true; };
//     this.mouseUp = function (e) { report('release', mouse_event(e)); return true; };
//     this.mouseMove = function (e) { report('move', mouse_event(e)); return true; };
//     this.mouseEnter = function (e) { report('enter', mouse_event(e)); return true; };
//     this.mouseLeave = function (e) { report('leave', mouse_event(e)); return true; };
//     this.mouseWheel = function (e) { report('wheel', wheel_event(e)); return true; };
//     // elmt.on('dragstart',function() {return false;});
//     // elmt.on('mousewheel', function(e){report('wheel',wheel_event($(this),e)); return false;});

//     let m_element = null;
//     let m_handlers = {
//         press: [], release: [], move: [], enter: [], leave: [], wheel: [], drag: [], drag_release: []
//     };
//     let m_dragging = false;
//     let m_drag_anchor = null;
//     let m_drag_pos = null;
//     let m_drag_rect = null;
//     let m_last_report_drag = new Date();
//     let m_scheduled_report_drag_X = null;

//     function report(name, X) {
//         if (name === 'drag') {
//             let elapsed = (new Date()) - m_last_report_drag;
//             if (elapsed < 50) {
//                 schedule_report_drag(X, 50 - elapsed + 10);
//                 return;
//             }
//             m_last_report_drag = new Date();
//         }
//         for (let i in m_handlers[name]) {
//             m_handlers[name][i](X);
//         }
//         drag_functionality(name, X);
//     }

//     function schedule_report_drag(X, timeout) {
//         if (m_scheduled_report_drag_X) {
//             m_scheduled_report_drag_X = X;
//             return;
//         }
//         else {
//             m_scheduled_report_drag_X = X;
//             setTimeout(() => {
//                 let X2 = m_scheduled_report_drag_X;
//                 m_scheduled_report_drag_X = null;
//                 report('drag', X2);
//             }, timeout)
//         }

//     }

//     function drag_functionality(name, X) {
//         if (name === 'press') {
//             m_dragging = false;
//             m_drag_anchor = cloneSimpleArray(X.pos);
//             m_drag_pos = null;
//         }
//         else if (name === 'release') {
//             if (m_dragging) {
//                 report('drag_release', { anchor: cloneSimpleArray(m_drag_anchor), pos: cloneSimpleArray(m_drag_pos), rect: cloneSimpleArray(m_drag_rect) });
//             }
//             m_dragging = false;
//         }
//         if ((name === 'move') && (X.buttons === 1)) {
//             // move with left button
//             if (m_dragging) {
//                 m_drag_pos = cloneSimpleArray(X.pos);
//             }
//             else {
//                 if (!m_drag_anchor) {
//                     m_drag_anchor = cloneSimpleArray(X.pos);
//                 }
//                 const tol = 4;
//                 if ((Math.abs(X.pos[0] - m_drag_anchor[0]) > tol) || (Math.abs(X.pos[1] - m_drag_anchor[1]) > tol)) {
//                     m_dragging = true;
//                     m_drag_pos = cloneSimpleArray(X.pos);
//                 }
//             }
//             if (m_dragging) {
//                 m_drag_rect = [Math.min(m_drag_anchor[0], m_drag_pos[0]), Math.min(m_drag_anchor[1], m_drag_pos[1]), Math.abs(m_drag_pos[0] - m_drag_anchor[0]), Math.abs(m_drag_pos[1] - m_drag_anchor[1])];
//                 report('drag', { anchor: cloneSimpleArray(m_drag_anchor), pos: cloneSimpleArray(m_drag_pos), rect: cloneSimpleArray(m_drag_rect) });
//             }
//         }
//     }

//     function mouse_event(e) {
//         if (!m_element) return {};
//         //var parentOffset = $(this).parent().offset();
//         //var offset=m_element.offset(); //if you really just want the current element's offset
//         var rect = m_element.getBoundingClientRect();
//         window.m_element = m_element;
//         window.dbg_m_element = m_element;
//         window.dbg_e = e;
//         var posx = e.clientX - rect.x;
//         var posy = e.clientY - rect.y;
//         return {
//             pos: [posx, posy],
//             modifiers: { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey },
//             buttons: e.buttons
//         };
//     }
//     function wheel_event(e) {
//         return {
//             delta: e.originalEvent.wheelDelta
//         };
//     }
// }

// // function clone(obj) {
// //     return JSON.parse(JSON.stringify(obj));
// // }

// function cloneSimpleArray(x) {
//     return x.slice(0);
// }


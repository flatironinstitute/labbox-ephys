type Vec2 = number[]
const isVec2 = (x: any): x is Vec2 => {
    if ((x) && (Array.isArray(x)) && (x.length === 2)) {
        for (let a of x) {
            if (!isNumber(a)) return false
        }
        return true
    }
    else return false
}

type Vec3 = number[]
const isVec3 = (x: any): x is Vec2 => {
    if ((x) && (Array.isArray(x)) && (x.length === 3)) {
        for (let a of x) {
            if (!isNumber(a)) return false
        }
        return true
    }
    else return false
}

type Vec4 = number[]
const isVec4 = (x: any): x is Vec4 => {
    if ((x) && (Array.isArray(x)) && (x.length === 4)) {
        for (let a of x) {
            if (!isNumber(a)) return false
        }
        return true
    }
    else return false
}


const isNumber = (x: any): x is number => {
    return ((x) && (typeof(x) === 'number'))
}

const isString = (x: any): x is string => {
    return ((x) && (typeof(x) === 'string'))
}

interface TextAlignment {
    AlignLeft?: boolean
    AlignCenter?: boolean
    AlignRight?: boolean

    AlignTop?: boolean
    AlignVCenter?: boolean
    AlignBottom?: boolean
}


// html5 canvas context
interface Context2D {
    clearRect: (x: number, y: number, W: number, H: number) => void,
    save: () => void,
    restore: () => void,
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

interface CanvasLayer {
    width: () => number,
    height: () => number,
    margins: () => Vec4
    coordXRange: () => Vec2
    coordYRange: () => Vec2
}

type Color = 'black' | 'red' | 'blue' | 'transparent' | string

interface Pen {
    color: Color,
    width?: number
}

interface Font {
    "pixel-size": number,
    family: 'Arial' | string
}

interface Brush {
    color: Color
}
const isBrush = (x: any): x is Brush => {
    if (!x) return false
    if (typeof(x) !== 'object') return false
    if (!('color' in x)) return false
    return true
}



type Rect = Vec4;
const isRect = (x: any): x is Rect => {
    return isVec4(x)
}

class CanvasPainter {
    #pen: Pen = { color: 'black' }
    #font: Font = { "pixel-size": 12, family: 'Arial' }
    #brush: Brush = { color: 'black' }
    #useCoords: boolean = false
    #exportingFigure: boolean = false
    #context2D: Context2D
    #canvasLayer: CanvasLayer
    constructor(context2d: Context2D, canvasLayer: CanvasLayer) {
        this.#context2D = context2d
        this.#canvasLayer = canvasLayer
    }
    pen() {
        return {...this.#pen}
    }
    font() {
        return {...this.#font}
    }
    brush() {
        return {...this.#brush}
    }
    setPen(pen: Pen) {
        this.#pen = {...pen}
    }
    setFont(font: Font) {
        this.#font = {...font}
    }
    setBrush(brush: Brush) {
        this.#brush = {...brush}
    }
    useCoords() {
        this.#useCoords = true;
    }
    usePixels() {
        this.#useCoords = false;
    }
    createPainterPath() {
        return new PainterPath()
    }
    newPainterPath() {
        // todo: remove
        console.warn('DEPRECATED: newPainterPath')
        return this.createPainterPath()
    }
    setExportingFigure(val: boolean) {
        this.#exportingFigure = val
    }
    exportingFigure() {
        return this.#exportingFigure
    }
    _initialize() {
        console.warn('DEPRECATED: _initialize')
    }
    _finalize() {
        console.warn('DEPRECATED: _finalize')
    }
    clear(): void {
        this.clearRect(0, 0, this.#canvasLayer.width(), this.#canvasLayer.height());
    }
    clearRect(x: number, y: number, W: number, H: number) {
        this.fillRect(x, y, W, H, {color: 'transparent'})
    }
    ctxSave() {
        this.#context2D.save();
    }
    ctxRestore() {
        this.#context2D.restore();
    }
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
    coordsToPix(x: number | Vec2, y: number | undefined = undefined): Vec2 {
        if (y === undefined) {
            if (typeof x === 'number') {
                throw Error('unexpected');
            }
            let tmp = x;
            x = tmp[0];
            y = tmp[1];
        }
        if (typeof x !== 'number') {
            throw Error('unexpected');
        }
        const margins = this.#canvasLayer.margins();
        const xr = this.#canvasLayer.coordXRange();
        const yr = this.#canvasLayer.coordYRange();
        let W = this.#canvasLayer.width() - margins[0] - margins[1];
        let H = this.#canvasLayer.height() - margins[2] - margins[3];
        // const xextent = xr[1] - xr[0];
        // const yextent = yr[1] - yr[0];
        // if (canvasLayer.preserveAspectRatio()) {
        //     if ((W * yextent > H * xextent) && (yextent)) {
        //         W = H * xextent / yextent;
        //     }
        //     else if ((H * xextent > W * yextent) && (xextent)) {
        //         H = W * yextent / xextent;
        //     }
        // }
        const xpct = (x - xr[0]) / (xr[1] - xr[0]);
        const ypct = 1 - (y - yr[0]) / (yr[1] - yr[0]);
        return [margins[0] + W * xpct, margins[2] + H * ypct];
    }
    fillRect(x: number | Vec4, y: number | Brush, W: number | undefined = undefined, H: number | undefined = undefined, brush: Brush | undefined = undefined) {
        if (isVec4(x)) {
            this.fillRect(x[0], x[1], x[2], x[3], brush)
            return
        }
        if ((!isNumber(x)) || (!isNumber(y)) || (!isNumber(W)) || (!isNumber(H))) {
            throw Error('Unexpected')
        }
        if ((!isBrush(brush)) && (!isString(brush))) {
            throw Error('Unexpected')
        }
        if (isString(brush)) brush = { color: brush };
        this.#context2D.fillStyle = toColorStr(brush.color);
        this.#context2D.fillRect(x, y, W, H);
    }
    drawRect(x: number | Vec4, y: number | undefined = undefined, W: number | undefined = undefined, H: number | undefined = undefined) {
        if (isVec4(x)) {
            this.drawRect(x[0], x[1], x[2], x[3])
            return
        }
        if ((!isNumber(x)) || (!isNumber(y)) || (!isNumber(W)) || (!isNumber(H))) {
            throw Error('Unexpected')
        }
        applyPen(this.#context2D, this.#pen)
        this.#context2D.strokeRect(x, y, W, H);
    }
    fillEllipse(x: number | Vec4, y: number | Brush, W: number | undefined = undefined, H: number | undefined = undefined, brush: Brush | undefined = undefined) {
        if (isVec4(x)) {
            this.fillRect(x[0], x[1], x[2], x[3], brush)
            return
        }
        if ((!isNumber(x)) || (!isNumber(y)) || (!isNumber(W)) || (!isNumber(H))) {
            throw Error('Unexpected')
        }
        if ((!isBrush(brush)) && (!isString(brush))) {
            throw Error('Unexpected')
        }
        if (isString(brush)) brush = { color: brush };
        this.#context2D.fillStyle = toColorStr(brush.color);
        this.#context2D.beginPath()
        this.#context2D.ellipse(x + W / 2, y + H / 2, W / 2, H / 2, 0, 0, 2 * Math.PI);
        this.#context2D.fill();
    }
    drawEllipse(x: number | Vec4, y: number | undefined = undefined, W: number | undefined = undefined, H: number | undefined = undefined) {
        if (isVec4(x)) {
            this.drawRect(x[0], x[1], x[2], x[3])
            return
        }
        if ((!isNumber(x)) || (!isNumber(y)) || (!isNumber(W)) || (!isNumber(H))) {
            throw Error('Unexpected')
        }
        applyPen(this.#context2D, this.#pen)
        this.#context2D.beginPath();
        this.#context2D.ellipse(x + W / 2, y + H / 2, W / 2, H / 2, 0, 0, 2 * Math.PI);
        this.#context2D.stroke();
    }
    drawPath(painterPath: PainterPath) {
        applyPen(this.#context2D, this.#pen)
        painterPath._draw(this.#context2D, (p: Vec2) => (this.transformXY(p)))
    }
    drawLine(x1: number, y1: number, x2: number, y2: number) {
        var pPath = new PainterPath();
        pPath.moveTo(x1, y1);
        pPath.lineTo(x2, y2);
        this.drawPath(pPath);
    }
    drawText(rect: Rect, alignment: TextAlignment, txt: string) {
        const rect2 = this.transformRect(rect)
        var x, y, textAlign, textBaseline;
        if (alignment.AlignLeft) {
            x = rect[0];
            textAlign = 'left';
        }
        else if (alignment.AlignCenter) {
            x = rect[0] + rect[2] / 2;
            textAlign = 'center';
        }
        else if (alignment.AlignRight) {
            x = rect[0] + rect[2];
            textAlign = 'right';
        }
        else {
            console.error('Missing horizontal alignment in drawText: AlignLeft, AlignCenter, or AlignRight');
        }

        if (alignment.AlignTop) {
            y = rect[1];
            textBaseline = 'top';
        }
        else if (alignment.AlignBottom) {
            y = rect[1] + rect[3];
            textBaseline = 'bottom';
        }
        else if (alignment.AlignVCenter) {
            y = rect[1] + rect[3] / 2;
            textBaseline = 'middle';
        }
        else {
            console.error('Missing vertical alignment in drawText: AlignTop, AlignBottom, or AlignVCenter');
        }

        this.#context2D.font = this.#font['pixel-size'] + 'px ' + this.#font.family
        this.#context2D.textAlign = textAlign || ''
        this.#context2D.textBaseline = textBaseline || ''
        applyPen(this.#context2D, this.#pen);
        this.#context2D.fillStyle = toColorStr(this.#brush.color);
        this.#context2D.fillText(txt, x, y);
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

    transformRect(rect: Rect): Rect {
        return this.transformXYWH(rect[0], rect[1], rect[2], rect[3]);
    }
    transformXYWH(x: number, y: number, W: number, H: number): Rect {
        let pt1 = this.transformXY(x, y);
        let pt2 = this.transformXY(x + W, y + H);
        return [Math.min(pt1[0], pt2[0]), Math.min(pt1[1], pt2[1]), Math.abs(pt2[0] - pt1[0]), Math.abs(pt2[1] - pt1[1])];
    }
    transformXY(x: number | Vec2, y: number | undefined = undefined): Vec2 {
        if (isVec2(x)) {
            return this.transformXY(x[0], x[1])
        }
        if (!isNumber(y)) {
            throw Error('unexpected')
        }
        const margins = this.#canvasLayer.margins();
        if (this.#useCoords) {
            return this.coordsToPix(x, y);
        }
        else {
            return [margins[0] + x, margins[2] + y];
        }
    }
}

interface PainterPathAction {
    name: 'moveTo' | 'lineTo'
    x: number
    y: number
}

class PainterPath {
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
    _draw(ctx: Context2D, transformXY: (p: Vec2) => Vec2) {
        ctx.beginPath();
        this.#actions.forEach(a => {
            this._applyAction(ctx, a, transformXY)
        })
        ctx.stroke();
    }
    _applyAction(ctx: Context2D, a: PainterPathAction, transformXY: (p: Vec2) => Vec2) {
        let pos = transformXY([a.x, a.y])
        if (a.name === 'moveTo') {
            ctx.moveTo(pos[0], pos[1]);
        }
        else if (a.name === 'lineTo') {
            ctx.lineTo(pos[0], pos[1]);
        }
    }
}

const toColorStr = (col: string | Vec3): string => {
    if (isString(col)) return col
    else if (isVec3(col)) {
        return 'rgb(' + Math.floor(col[0]) + ',' + Math.floor(col[1]) + ',' + Math.floor(col[2]) + ')'
    }
    else {
        throw Error('unexpected')
    }
}

const applyPen = (ctx: Context2D, pen: Pen) => {
    if ('color' in pen)
        ctx.strokeStyle = toColorStr(pen.color);
    else
        ctx.strokeStyle = 'black'
    if (('width' in pen) && (isNumber(pen.width)))
        ctx.lineWidth = pen.width
    else
        ctx.lineWidth = 1
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

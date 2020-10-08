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
    this.drawLine = function (x1, y1, x2, y2) {
        var ppath = new PainterPath();
        ppath.moveTo(x1, y1);
        ppath.lineTo(x2, y2);
        that.drawPath(ppath);
    };
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
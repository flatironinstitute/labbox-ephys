




export const CanvasPainterOld = () => {
    this.drawPath = function (painter_path) {
        apply_pen(ctx, m_pen);
        painter_path._draw(ctx, transformXY);
    };
    this.drawLine = function (x1, y1, x2, y2) {
        var ppath = new PainterPath();
        ppath.moveTo(x1, y1);
        ppath.lineTo(x2, y2);
        that.drawPath(ppath);
    };
    this.drawText = function (rect, alignment, txt, opts) {
        let rect2 = transformRect(rect);
        return _drawText(rect2, alignment, txt);
    }
    this.createImageData = function(W, H) {
        return ctx.getImageData(W, H);
    }
    this.putImageData = function(imagedata, x, y) {
        ctx.putImageData(imagedata, x, y);
    }
    this.drawImage = function(image, dx, dy) {
        ctx.drawImage(image, dx, dy);
    }
    function _drawText(rect, alignment, txt) {
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

        ctx.font = m_font['pixel-size'] + 'px ' + m_font.family;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        apply_pen(ctx, m_pen);
        ctx.fillStyle = to_color(m_brush.color);
        ctx.fillText(txt, x, y);
    }
    this.drawMarker = function(x, y, radius, shape, opts) {
        opts = opts || {};
        let pt = transformXY(x, y);
        _drawMarker(pt[0], pt[1], radius, shape, opts);
    }
    function _drawMarker(x, y, radius, shape, opts) {
        shape = shape || 'circle';
        let rect = [x-radius, y-radius, 2*radius, 2*radius];
        if (shape === 'circle') {
            if (opts.fill) {
                _fillEllipse(rect);
            }
            else {
                _drawEllipse(rect);
            }
        }
        else {
            console.error(`Unrecognized marker shape ${shape}`);
        }
    }
    this.fillMarker = function(x, y, radius, shape) {
        let pt = transformXY(x, y);
        _drawMarker(pt[0], pt[1], radius, shape, {fill: true});
    }
    

    
    
    
}

export function MouseHandler() {
    this.setElement = function (elmt) { m_element = elmt; };
    this.onMousePress = function (handler) { m_handlers['press'].push(handler); };
    this.onMouseRelease = function (handler) { m_handlers['release'].push(handler); };
    this.onMouseMove = function (handler) { m_handlers['move'].push(handler); };
    this.onMouseEnter = function (handler) { m_handlers['enter'].push(handler); };
    this.onMouseLeave = function (handler) { m_handlers['leave'].push(handler); };
    this.onMouseWheel = function (handler) { m_handlers['wheel'].push(handler); };
    this.onMouseDrag = function (handler) { m_handlers['drag'].push(handler); };
    this.onMouseDragRelease = function (handler) { m_handlers['drag_release'].push(handler); };

    this.mouseDown = function (e) { report('press', mouse_event(e)); return true; };
    this.mouseUp = function (e) { report('release', mouse_event(e)); return true; };
    this.mouseMove = function (e) { report('move', mouse_event(e)); return true; };
    this.mouseEnter = function (e) { report('enter', mouse_event(e)); return true; };
    this.mouseLeave = function (e) { report('leave', mouse_event(e)); return true; };
    this.mouseWheel = function (e) { report('wheel', wheel_event(e)); return true; };
    // elmt.on('dragstart',function() {return false;});
    // elmt.on('mousewheel', function(e){report('wheel',wheel_event($(this),e)); return false;});

    let m_element = null;
    let m_handlers = {
        press: [], release: [], move: [], enter: [], leave: [], wheel: [], drag: [], drag_release: []
    };
    let m_dragging = false;
    let m_drag_anchor = null;
    let m_drag_pos = null;
    let m_drag_rect = null;
    let m_last_report_drag = new Date();
    let m_scheduled_report_drag_X = null;

    function report(name, X) {
        if (name === 'drag') {
            let elapsed = (new Date()) - m_last_report_drag;
            if (elapsed < 50) {
                schedule_report_drag(X, 50 - elapsed + 10);
                return;
            }
            m_last_report_drag = new Date();
        }
        for (let i in m_handlers[name]) {
            m_handlers[name][i](X);
        }
        drag_functionality(name, X);
    }

    function schedule_report_drag(X, timeout) {
        if (m_scheduled_report_drag_X) {
            m_scheduled_report_drag_X = X;
            return;
        }
        else {
            m_scheduled_report_drag_X = X;
            setTimeout(() => {
                let X2 = m_scheduled_report_drag_X;
                m_scheduled_report_drag_X = null;
                report('drag', X2);
            }, timeout)
        }
        
    }

    function drag_functionality(name, X) {
        if (name === 'press') {
            m_dragging = false;
            m_drag_anchor = cloneSimpleArray(X.pos);
            m_drag_pos = null;
        }
        else if (name === 'release') {
            if (m_dragging) {
                report('drag_release', { anchor: cloneSimpleArray(m_drag_anchor), pos: cloneSimpleArray(m_drag_pos), rect: cloneSimpleArray(m_drag_rect) });
            }
            m_dragging = false;
        }
        if ((name === 'move') && (X.buttons === 1)) {
            // move with left button
            if (m_dragging) {
                m_drag_pos = cloneSimpleArray(X.pos);
            }
            else {
                if (!m_drag_anchor) {
                    m_drag_anchor = cloneSimpleArray(X.pos);
                }
                const tol = 4;
                if ((Math.abs(X.pos[0] - m_drag_anchor[0]) > tol) || (Math.abs(X.pos[1] - m_drag_anchor[1]) > tol)) {
                    m_dragging = true;
                    m_drag_pos = cloneSimpleArray(X.pos);
                }
            }
            if (m_dragging) {
                m_drag_rect = [Math.min(m_drag_anchor[0], m_drag_pos[0]), Math.min(m_drag_anchor[1], m_drag_pos[1]), Math.abs(m_drag_pos[0] - m_drag_anchor[0]), Math.abs(m_drag_pos[1] - m_drag_anchor[1])];
                report('drag', { anchor: cloneSimpleArray(m_drag_anchor), pos: cloneSimpleArray(m_drag_pos), rect: cloneSimpleArray(m_drag_rect) });
            }
        }
    }

    function mouse_event(e) {
        if (!m_element) return {};
        //var parentOffset = $(this).parent().offset(); 
        //var offset=m_element.offset(); //if you really just want the current element's offset
        var rect = m_element.getBoundingClientRect();
        window.m_element = m_element;
        window.dbg_m_element = m_element;
        window.dbg_e = e;
        var posx = e.clientX - rect.x;
        var posy = e.clientY - rect.y;
        return {
            pos: [posx, posy],
            modifiers: { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey },
            buttons: e.buttons
        };
    }
    function wheel_event(e) {
        return {
            delta: e.originalEvent.wheelDelta
        };
    }
}

// function clone(obj) {
//     return JSON.parse(JSON.stringify(obj));
// }

function shallowClone(obj) {
    return Object.assign({}, obj);
}

function cloneSimpleArray(x) {
    return x.slice(0);
}


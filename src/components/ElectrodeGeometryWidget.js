import React, { Component } from "react";
// import AutoDetermineWidth from './jscommon/AutoDetermineWidth';
import { SizeMe } from 'react-sizeme';
import CanvasWidget from './jscommon/CanvasWidget';
import { CanvasWidgetLayer } from './jscommon/CanvasWidget/CanvasWidgetLayer';
import { getTransformationMatrix, pointSpanToRegion, rectangularRegionsIntersect } from './jscommon/CanvasWidget/Geometry';
const stable_stringify = require('json-stable-stringify');

export default class ElectrodeGeometryWidget extends Component {
    render() {
        return (
            <SizeMe
                render={
                    ({ size }) => {
                        return <div>
                            <
                                ElectrodeGeometryWidgetInner
                                {...this.props}
                                width={size.width} 
                                maxHeight={1800}
                            />
                        </div>;
                    }
                }
            />
        );
    }
}

class ElectrodeGeometryWidgetInner extends Component {
    constructor(props) {
        super(props);
        this.xmin = 0;
        this.xmax = 1;
        this.ymin = 0;
        this.ymax = 2;
        this.transpose = false;
        this.channel_rects = {};
        this.dragSelectRect = null;

        this.state = {
            hoveredElectrodeIds: {},
            _canvasWidth: 0,
            _canvasHeight: 0
        }

        // this.dragSelectLayer = new CanvasWidgetLayer(this.paintDragSelect, props);
        this.mainLayer = new CanvasWidgetLayer(this.paintMainLayer, {...props, width: props.width || 400, height: props.height || 400});
    }

    componentDidMount() {
        this.computeSize();
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps) {
        if (
            (this.props.locations !== prevProps.locations) ||
            (this.props.ids !== prevProps.ids) ||
            (this.props.width !== prevProps.width) ||
            (this.props.height !== prevProps.height) ||
            (this.props.maxWidth !== prevProps.maxWidth) ||
            (this.props.maxHeight !== prevProps.maxHeight)
        ) {
            this.computeSize();
            this.mainLayer.repaint();
        }
        else {
            this.mainLayer.repaint();
        }
    }

    computeSize() {
        this.updatePositions();

        let W = this.props.width;
        if (!W) W = 400;

        let H = this.props.height;
        let x1 = this.xmin - this.mindist * 3, x2 = this.xmax + this.mindist * 3;
        let y1 = this.ymin - this.mindist * 3, y2 = this.ymax + this.mindist * 3;
        let w0 = x2 - x1, h0 = y2 - y1;
        if (this.transpose) {
            let w0_tmp = w0;
            w0 = h0;
            h0 = w0_tmp;
        }

        if (!H) {
            if (!w0) {
                H = 100;
            }
            else {
                H = h0 / w0 * W;
            }
        }
        const maxWidth = this.props.maxWidth || 500;
        const maxHeight = this.props.maxHeight || 500;
        if (W > maxWidth) {
            W = maxWidth;
            H = h0 * W / w0;
        }
        if (H > maxHeight) {
            H = maxHeight;
            W = w0 * H / h0;
        }
        this.setState({
            _canvasWidth: W,
            _canvasHeight: H
        });
    }

    paintDragSelect = (painter) => {
        if (this.dragSelectRect) {
            painter.fillRect(this.dragSelectRect, {color: 'lightgray'});
        }
    }

    ids() {
        if (this.props.ids) {
            return this.props.ids;
        }
        else if (this.props.locations) {
            let ids = [];
            for (let i = 0; i < this.props.locations.length; i++) {
                ids.push(i);
            }
            return ids;
        }
        else {
            return [];
        }
    }

    paintMainLayer = (painter) => {
        let ids = this.ids();

        const W = this.state._canvasWidth;
        const H = this.state._canvasHeight;

        if (W === 0 || H === 0) return
        // quick hack to get display to work: the old widget wants to work in pixelspace.
        // TODO: Note that drag selection needs to be fixed along the same lines;
        // It's reporting pixelspace which is getting converted to something else...
        const myCoordinates = { xmin: 0, ymin: 0, xmax: W, ymax: H }
        const tmatrix = getTransformationMatrix(myCoordinates, painter.getCoordRange())
        const myPainter = painter.applyNewTransformationMatrix(tmatrix)

        let W1 = W, H1 = H;
        if (this.transpose) {
            W1 = H;
            H1 = W;
        }

        let x1 = this.xmin - this.mindist, x2 = this.xmax + this.mindist;
        let y1 = this.ymin - this.mindist, y2 = this.ymax + this.mindist;
        let w0 = x2 - x1, h0 = y2 - y1;
        let offset, xscale, yscale;
        if (w0 * H1 > h0 * W1) {
            xscale = W1 / w0;
            yscale = xscale;
            offset = [0 - x1 * xscale, (H1 - h0 * yscale) / 2 - y1 * yscale];
        } else {
            yscale = H1 / h0;
            xscale = yscale;
            if (h0 > w0 * 8) {
                xscale = xscale * 5;
            }
            offset = [(W1 - w0 * xscale) / 2 - x1 * xscale, 0 - y1 * yscale];
        }
        this.channel_rects = {};
        if (this.props.locations) {
            for (let i in this.props.locations) {
                let id0 = ids[i];
                let pt0 = this.props.locations[i];
                let x = pt0[0] * xscale + offset[0];
                let y = pt0[1] * yscale + offset[1];
                let rad = this.mindist * Math.min(xscale, yscale) / 3;
                let x1 = x, y1 = y;
                if (this.transpose) {
                    x1 = y;
                    y1 = x;
                }
                let col = this.getElectrodeColor(id0);
                const boundingRect = { xmin: x1 - rad, ymin: y1 - rad, xmax: x1 + rad, ymax: y1 + rad }
                myPainter.fillEllipse(boundingRect, { color: col });
                this.channel_rects[i] = boundingRect;
                const labelBrush = { color: 'white' };
                const labelFont = { 'pixel-size': rad }
                myPainter.drawText(boundingRect, { Horizontal: 'AlignCenter', Vertical: 'AlignCenter' }, labelFont, myPainter.getDefaultPen(), labelBrush, id0);
            }
        }
    }

    updatePositions() {
        if (!this.props.locations) {
            return;
        }
        let pt0 = this.props.locations[0] || [0, 0];
        let xmin = pt0[0], xmax = pt0[0];
        let ymin = pt0[1], ymax = pt0[1];
        for (let i in this.props.locations) {
            let pt = this.props.locations[i];
            xmin = Math.min(xmin, pt[0]);
            xmax = Math.max(xmax, pt[0]);
            ymin = Math.min(ymin, pt[1]);
            ymax = Math.max(ymax, pt[1]);
        }
        // if (xmax === xmin) xmax++;
        // if (ymax === ymin) ymax++;

        this.xmin = xmin; this.xmax = xmax;
        this.ymin = ymin; this.ymax = ymax;


        this.transpose = this.props.noTranspose ? false : (this.ymax - this.ymin > this.xmax - this.xmin);

        let mindists = [];
        for (var i in this.props.locations) {
            let pt0 = this.props.locations[i];
            let mindist = -1;
            for (let j in this.props.locations) {
                let pt1 = this.props.locations[j];
                let dx = pt1[0] - pt0[0];
                let dy = pt1[1] - pt0[1];
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    if ((dist < mindist) || (mindist < 0))
                        mindist = dist;
                }
            }
            if (mindist > 0) mindists.push(mindist);
        }
        let avg_mindist = compute_average(mindists);
        if (avg_mindist <= 0) avg_mindist = 1;
        this.mindist = avg_mindist;
    }

    getElectrodeColor(id) {
        let color = 'rgb(0, 0, 255)';
        let color_hover = 'rgb(100, 100, 255)';
        let color_current = 'rgb(200, 200, 100)';
        let color_current_hover = 'rgb(220, 220, 100)';
        let color_selected = 'rgb(180, 180, 150)';
        let color_selected_hover = 'rgb(200, 200, 150)';

        if (id === this.props.currentElectrodeId) {
            if (id in this.state.hoveredElectrodeIds) {
                return color_current_hover;
            }
            else {
                return color_current;
            }
        }
        else if ((this.props.selectedElectrodeIds || {})[id]) {
            if (id in this.state.hoveredElectrodeIds) {
                return color_selected_hover;
            }
            else {
                return color_selected;
            }
        }
        else {
            if (id in this.state.hoveredElectrodeIds) {
                return color_hover;
            }
            else {
                return color;
            }
        }
    }

    electrodeIdAtPixel(pos) {
        const ids = this.ids();
        for (let i in this.channel_rects) {
            let rect0 = this.channel_rects[i];
            if ((rect0.xmin <= pos[0]) && (pos[0] <= rect0.xmax)) {
                if ((rect0.ymin <= pos[1]) && (pos[1] <= rect0.ymax)) {
                    return ids[i];
                }
            }
        }
        return null;
    }

    electrodeIdsInRect(rect) {
        const ids = this.ids();
        let ret = [];
        for (let i in this.channel_rects) {
            let rect0 = this.channel_rects[i];
            if (rectangularRegionsIntersect(rect, rect0)) {
                ret.push(ids[i]);
            }
        }
        return ret;
    }

    setHoveredElectrodeId(id) {
        this.setHoveredElectrodeIds([id]);
    }

    setHoveredElectrodeIds(ids) {
        let tmp = {};
        for (let id of ids)
            tmp[id] = true;
        if (JSON.parse(stable_stringify(tmp)) === this.state.hoveredElectrodeIds)
            return;
        this.setState({
            hoveredElectrodeIds: tmp
        });
    }

    setCurrentElectrodeId(id) {
        if (id === this.props.currentElectrodeId)
            return;
        this.props.onCurrentElectrodeIdChanged && this.props.onCurrentElectrodeIdChanged(id);
    }

    setSelectedElectrodeIds(ids) {
        let newsel = {};
        for (let id of ids) {
            newsel[id] = true;
        }
        if (stable_stringify(newsel) === stable_stringify(this.props.selectedElectrodeIds || {})) {
            return;
        }
        this.props.onSelectedElectrodeIdsChanged && this.props.onSelectedElectrodeIdsChanged(newsel);
    }

    selectElectrodeId(id) {
        let x = JSON.parse(JSON.stringify(this.props.selectedElectrodeIds || {}));
        x[id] = true;
        let ids = [];
        for (let id0 in x) ids.push(id0);
        this.setSelectedElectrodeIds(ids);
    }

    deselectElectrodeId(id) {
        let x = JSON.parse(JSON.stringify(this.props.selectedElectrodeIds || {}));
        delete x[id];
        let ids = [];
        for (let id0 in x) ids.push(id0);
        this.setSelectedElectrodeIds(ids);
    }

    handleMousePress = (X) => {
        if (!X) return;
        let elec_id = this.electrodeIdAtPixel(X.pos);
        if ((X.modifiers.ctrlKey) || (X.modifiers.shiftKey)) {
            if (elec_id in (this.props.selectedElectrodeIds || {})) {
                this.deselectElectrodeId(elec_id);
            }
            else {
                this.selectElectrodeId(elec_id);
            }
        }
        else {
            this.setCurrentElectrodeId(elec_id);
            this.setSelectedElectrodeIds([elec_id]);
        }
    }

    handleMouseRelease = (X) => {
    }

    handleMouseMove = (X) => {
        if (!X) return;
        if (!this.dragSelectRect) {
            let elec_id = this.electrodeIdAtPixel(X.pos);
            this.setHoveredElectrodeId(elec_id);
        }
    }

    handleMouseDrag = (X) => {
        const currentDrag = pointSpanToRegion(X.rect)
        if (JSON.stringify(currentDrag) !== JSON.stringify(this.dragSelectRect)) {
            this.dragSelectRect = currentDrag
            this.setHoveredElectrodeIds(this.electrodeIdsInRect(this.dragSelectRect));
        }
    }

    handleMouseDragRelease = (X) => {
        let ids = this.electrodeIdsInRect(pointSpanToRegion(X.rect));
        this.setCurrentElectrodeId(null);
        this.setSelectedElectrodeIds(ids);
        if (ids.length === 1) {
            this.setCurrentElectrodeId(ids[0]);
        }
        this.dragSelectRect = null;
        this.setState({
            hoveredElectrodeIds: {}
        });
    }

    render() {
        if (this.props.locations === undefined) {
            return <span>
                <div>Loading...</div>
            </span>
        }
        else if (this.props.locations === null) {
            return <span>
                <div>Not found.</div>
            </span>
        }
        let layers = [
            this.dragSelectLayer,
            this.mainLayer
        ];
        return <CanvasWidget
            layers={layers}
            width={this.state._canvasWidth}
            height={this.state._canvasHeight}
            onMouseMove={this.handleMouseMove}
            onMousePress={this.handleMousePress}
            onMouseRelease={this.handleMouseRelease}
            onMouseDrag={this.handleMouseDrag}
            onMouseDragRelease={this.handleMouseDragRelease}
        />;
    }
}

function compute_average(list) {
    return list.length === 0 ? 0 : list.reduce((a, b) => (a + b)) / list.length
}

import { Brush, CanvasPainter, Font, Pen } from "../../common/CanvasWidget/CanvasPainter"
import { HitherInterface } from "../../common/hither"
import { Recording, Sorting } from "../../extensionInterface"
import { SpikeAmplitudesData } from "./useSpikeAmplitudesData"

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const colorList = [
    'blue',
    'green',
    'red',
    'orange',
    'purple'
]
const colorForUnitId = (unitId: number) => {
    while (unitId < 0) unitId += colorList.length
    return colorList[unitId % colorList.length]
} 

class SpikeAmplitudesPanel {
    _updateHandler: (() => void) | null = null
    _timeRange: {min: number, max: number} | null = null
    _calculationScheduled: boolean = false
    _calculationError: Error | null = null
    _yrange: {min: number, max: number} | null = null
    _panelGroup: SpikeAmplitudesPanel[] | null = null
    _includeZero = true
    _amplitudes: number[] | undefined = undefined
    constructor(private args: {spikeAmplitudesData: SpikeAmplitudesData, recording: Recording, sorting: Sorting, unitId: number, hither: HitherInterface}) {
    }
    setTimeRange(timeRange: {min: number, max: number}) {
        this._timeRange = timeRange
    }
    paint(painter: CanvasPainter, completenessFactor: number) {
        const timeRange = this._timeRange
        if (!timeRange) return
        const font: Font = {pixelSize: 12, family: 'Arial'}
        const color = colorForUnitId(this.args.unitId)
        const pen: Pen = {color: 'black'}
        const brush: Brush = {color}
        const result = this.args.spikeAmplitudesData.getSpikeAmplitudes(this.args.unitId)
        if ((result) && (result.timepoints) && (result.amplitudes)) {
            const { timepoints, amplitudes } = result
            this._amplitudes = amplitudes
            let yrange = this._yrange || this.autoYRange()
            if (!yrange) return
            if (this._includeZero) {
                yrange = {min: Math.min(0, yrange.min), max: Math.max(0, yrange.max)}
            }
            painter.drawLine(timeRange.min, 0, timeRange.max, 0, {color: 'gray'})
            const N = timepoints.length
            for (let i = 0; i < N; i++) {
                const t = timepoints[i]
                const a = amplitudes[i]
                const y = (a - yrange.min) / (yrange.max - yrange.min)
                if ((timeRange.min <= t) && (t <= timeRange.max)) {
                    painter.drawMarker([t, y], {radius: 3, pen, brush})
                }
            }
        }
        else {
            painter.drawText({xmin: timeRange.min, xmax: timeRange.max, ymin: 0, ymax: 1}, {Horizontal: 'AlignCenter', Vertical: 'AlignCenter'}, font, pen, brush, 'calculating')
        }
    }
    label() {
        return this.args.unitId + ''
    }
    amplitudeRange() {
        if (this._amplitudes) {
            return {min: Math.min(...this._amplitudes), max: Math.max(...this._amplitudes)}
        }
        else return null
    }
    autoYRange() {
        if ((this._panelGroup) && (this._panelGroup.length > 0)) {
            const amplitudeRanges = this._panelGroup.map(p => p.amplitudeRange()).filter(r => (r !== null))
            if (amplitudeRanges.length > 0) {
                const ampMin = Math.min(...amplitudeRanges.map(r => r?.min || 0))
                const ampMax = Math.max(...amplitudeRanges.map(r => r?.max || 0))
                return {min: ampMin, max: ampMax}
            }
        }
        return this.amplitudeRange()
    }
    setYRange(yrange: {min: number, max: number}) {
        this._yrange = yrange
    }
    setPanelGroup(panels: SpikeAmplitudesPanel[]) {
        this._panelGroup = panels
    }
    register(onUpdate: () => void) {
        this._updateHandler = onUpdate
    }
}

class CombinedPanel {
    constructor(private panels: SpikeAmplitudesPanel[], private labelString: string) {
    }
    setTimeRange(timeRange: {min: number, max: number}) {
        this.panels.forEach(p => p.setTimeRange(timeRange))
    }
    paint(painter: CanvasPainter, completenessFactor: number) {
        this.panels.forEach(p => p.paint(painter, completenessFactor))
    }
    label() {
        return this.labelString
    }
    register(onUpdate: () => void) {
        this.panels.forEach(p => p.register(() => {
            onUpdate()
        }))
    }
}

export const combinePanels = (panels: SpikeAmplitudesPanel[], label: string) => {
    return new CombinedPanel(panels, label)
}

export default SpikeAmplitudesPanel
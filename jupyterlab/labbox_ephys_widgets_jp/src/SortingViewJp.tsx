import { DOMWidgetModel, DOMWidgetView, ISerializers, WidgetModel } from '@jupyter-widgets/base';
import { MuiThemeProvider } from '@material-ui/core';
import React, { FunctionComponent, useEffect, useMemo, useReducer, useState } from 'react';
import ReactDOM from 'react-dom';
import '../css/styles.css';
import '../css/widget.css';
import extensionContext from './extensionContext';
import { useRecordingInfo, useSortingInfo } from './extensions/common/getRecordingInfo';
import { CalculationPool, createCalculationPool, HitherContext } from './extensions/common/hither';
import { sleepMsec } from './extensions/common/misc';
import { externalUnitMetricsReducer, filterPlugins, Plugins, Recording, Sorting, sortingCurationReducer, sortingSelectionReducer, SortingViewPlugin, useRecordingAnimation } from './extensions/extensionInterface';
import initializeHitherInterface from './extensions/initializeHitherInterface';
import theme from './extensions/theme';
import { AppendOnlyLog, useFeedReducer, useInterval } from './misc';
import Subfeed from './Subfeed';
import { MODULE_NAME, MODULE_VERSION } from './version';

const calculationPool = createCalculationPool({maxSimultaneous: 6})

export class SortingViewJpModel extends DOMWidgetModel {
    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
    }

    defaults() {
        return {
            ...super.defaults(),
            _model_name: SortingViewJpModel.model_name,
            _model_module: SortingViewJpModel.model_module,
            _model_module_version: SortingViewJpModel.model_module_version,
            _view_name: SortingViewJpModel.view_name,
            _view_module: SortingViewJpModel.view_module,
            _view_module_version: SortingViewJpModel.view_module_version,
            pluginName: '',
            sortingObject: {},
            recordingObject: {},
            curation: {},
            selection: {},
            externalUnitMetrics: []
        };
    }

    static serializers: ISerializers = {
        ...DOMWidgetModel.serializers,
        // Add any extra serializers here
    };

    static model_name = 'SortingViewJpModel';
    static model_module = MODULE_NAME;
    static model_module_version = MODULE_VERSION;
    static view_name = 'SortingViewJp'; // Set to null if no view
    static view_module = MODULE_NAME; // Set to null if no view
    static view_module_version = MODULE_VERSION;
}

export class SortingViewJp extends DOMWidgetView {
    // _hitherJobManager: HitherJobManager
    initialize() {
        // this._hitherJobManager = new HitherJobManager(this.model)
    }
    element() {
        const pluginName = this.model.get('pluginName')
        const sortingObject = this.model.get('sortingObject')
        const recordingObject = this.model.get('recordingObject')
        const recordingInfo = this.model.get('recordingInfo')
        const sortingInfo = this.model.get('sortingInfo')
        const curationUri = this.model.get('curationUri')
        const plugin = extensionContext._sortingViewPlugins[pluginName]

        if (!plugin) return <div>Plugin not found: {pluginName}</div>

        const baseSha1Url = `/sha1`
        const hither = initializeHitherInterface(msg => {
            if (msg.type === 'hitherCreateJob') _startIterating(300)
            this.model.send(msg, {})
        }, baseSha1Url)
        this.model.on('msg:custom', (msg: any) => {
            if (msg.type === 'hitherJobCreated') {
                _startIterating(300)
                hither.handleHitherJobCreated(msg)
            }
            else if (msg.type === 'hitherJobFinished') {
                _startIterating(300)
                hither.handleHitherJobFinished(msg)
            }
            else if (msg.type === 'hitherJobError') {
                _startIterating(300)
                hither.handleHitherJobError(msg)
            }
            else if (msg.type === 'debug') {
                console.info('DEBUG MESSAGE', msg)
            }
        })
        let _iterating = false
        let _iterate_interval = 200
        const _startIterating = (interval: number) => {
            _iterate_interval = interval
            if (_iterating) {
                this.model.send({ type: 'iterate' }, {})
                return
            }
            _iterating = true
                ; (async () => {
                    while (true) {
                        if (hither.getNumActiveJobs() === 0) {
                            _iterating = false
                            return
                        }
                        this.model.send({ type: 'iterate' }, {})
                        await sleepMsec(_iterate_interval)
                        _iterate_interval = Math.min(5000, _iterate_interval + 50)
                    }
                })()
        }

        const plugins: Plugins = {
            recordingViews: extensionContext._recordingViewPlugins,
            sortingViews: extensionContext._sortingViewPlugins,
            sortingUnitViews: extensionContext._sortingUnitViewPlugins,
            sortingUnitMetrics: extensionContext._sortingUnitMetricPlugins
        }

        return (
            <MuiThemeProvider theme={theme}>
                <HitherContext.Provider value={hither}>
                    <PluginComponentWrapper
                        plugin={plugin}
                        sortingObject={sortingObject}
                        recordingObject={recordingObject}
                        sortingInfo={sortingInfo}
                        recordingInfo={recordingInfo}
                        plugins={filterPlugins(plugins)}
                        calculationPool={calculationPool}
                        model={this.model}
                        curationUri={curationUri}
                    />
                </HitherContext.Provider>
            </MuiThemeProvider>
        )
    }
    render() {
        const pluginName = this.model.get('pluginName')
        const plugin = extensionContext._sortingViewPlugins[pluginName]
        if (!plugin) throw Error(`Plugin not found: ${pluginName}`)

        this.el.classList.add('plugin-' + pluginName)
        const x = this.element()
        const widgetHeight = this.model.get('widgetHeight')
        const style = this.el.style as { [key: string]: any }
        style.height = '100%'
        style['min-height'] = `${widgetHeight || plugin.notebookCellHeight || 500}px`
        ReactDOM.render(x, this.el)
    }
}

interface PluginComponentWrapperProps {
    plugin: SortingViewPlugin
    sortingObject: any
    recordingObject: any
    sortingInfo: any
    recordingInfo: any
    plugins: Plugins
    calculationPool: CalculationPool
    model: WidgetModel
    curationUri?: string
}

const PluginComponentWrapper: FunctionComponent<PluginComponentWrapperProps> = ({ plugin, sortingObject, recordingObject, plugins, calculationPool, model, curationUri }) => {
    const [sorting, setSorting] = useState<Sorting | null>(null)
    const [recording, setRecording] = useState<Recording | null>(null)

    const sortingInfo = useSortingInfo(sorting?.sortingObject, sorting?.recordingObject)
    const recordingInfo = useRecordingInfo(recording?.recordingObject)

    // curation
    // const [curation, curationDispatch] = useReducer(sortingCurationReducer, model.get('curation'))
    const curationSubfeed: AppendOnlyLog | null = useMemo(() => (curationUri ? new Subfeed(model, curationUri) : null), [curationUri, model])
    const [curation, curationDispatch] = useFeedReducer(sortingCurationReducer, curationSubfeed ? {} : model.get('curation'), curationSubfeed)
    useEffect(() => {
        if (model.get('curation') !== curation) {
            model.set('curation', curation)
            model.save_changes()
        }
    }, [curation, model])
    useEffect(() => {
        model.on('change:curation', () => {
            if (!curationSubfeed) {
                curationDispatch({
                    type: 'SetCuration',
                    curation: model.get('curation')
                })
            }
        }, null)
    }, [model, curationDispatch, curationSubfeed])

    // externalUnitMetrics
    const [externalUnitMetrics, externalUnitMetricsDispatch] = useReducer(externalUnitMetricsReducer, model.get('externalUnitMetrics') ? model.get('externalUnitMetrics') : [])
    useEffect(() => {
        if (model.get('externalUnitMetrics') !== externalUnitMetrics) {
            model.set('externalUnitMetrics', externalUnitMetrics)
            model.save_changes()
        }
    }, [externalUnitMetrics, model])
    useEffect(() => {
        model.on('change:externalUnitMetrics', () => {
            externalUnitMetricsDispatch({
                type: 'SetExternalUnitMetrics',
                externalUnitMetrics: model.get('externalUnitMetrics')
            })
        }, null)
    }, [model])

    useEffect(() => {
        setSorting({
            sortingId: '',
            sortingLabel: '',
            sortingPath: '',
            sortingObject,
            recordingId: '',
            recordingPath: '',
            recordingObject,
            curation,
            externalUnitMetrics
        })
        setRecording({
            recordingId: '',
            recordingLabel: '',
            recordingObject,
            recordingPath: ''
        })
    }, [setSorting, sortingObject, recordingObject, curation, externalUnitMetrics])

    // selection
    const [selection, selectionDispatch] = useReducer(sortingSelectionReducer, model.get('selection').selectedUnitIds ? model.get('selection') : {})
    useRecordingAnimation(selection, selectionDispatch)
    useEffect(() => {
        if (model.get('selection') !== selection) {
            model.set('selection', selection)
            model.save_changes()
        }
    }, [selection, model])
    useEffect(() => {
        model.on('change:selection', () => {
            selectionDispatch({
                type: 'SetSelection',
                selection: model.get('selection')
            })
        }, null)
    }, [model])

    // default time range
    useEffect(() => {
        if (recordingInfo) {
            if (!selection.timeRange) {
                const newTimeRange = { min: 0, max: Math.min(recordingInfo.num_frames, Math.floor(recordingInfo.sampling_frequency / 10)) }
                selectionDispatch({ type: 'SetTimeRange', timeRange: newTimeRange })
            }
        }
    }, [selection.timeRange, recordingInfo])

    const [divElement, setDivElement] = useState<HTMLDivElement | null>(null)
    const [width, setWidth] = useState<number | undefined>(undefined)
    const [height, setHeight] = useState<number | undefined>(undefined)
    const [pollIndex, setPollIndex] = useState(0)
    const divRef = React.useCallback((elmt: HTMLDivElement) => {
        // this should get called only once after the div has been written to the DOM
        // we set this div element so that it can be used below when we set the canvas
        // elements to the layers
        setDivElement(elmt)
    }, [])

    useEffect(() => {
        if (divElement) {
            if (width !== divElement.offsetWidth) {
                setWidth(divElement.offsetWidth)
            }
            if (height !== divElement.offsetHeight) {
                setHeight(divElement.offsetHeight)
            }
        }
    }, [divElement, width, height, setWidth, setHeight, pollIndex])

    useInterval(() => {
        setPollIndex(pollIndex + 1)
    }, 1000)

    if (!sorting) {
        return <div>No sorting</div>
    }
    if (!recording) {
        return <div>No recording</div>
    }
    if (!sortingInfo) {
        return <div>No sorting info</div>
    }
    if (!recordingInfo) {
        return <div>No recording info</div>
    }

    return (
        <div ref={divRef} className="PluginComponentWrapper" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <plugin.component
                sorting={sorting}
                sortingInfo={sortingInfo}
                recording={recording}
                recordingInfo={recordingInfo}
                curationDispatch={curationDispatch}
                selection={selection}
                selectionDispatch={selectionDispatch}
                readOnly={false}
                plugins={plugins}
                calculationPool={calculationPool}
                width={width}
                height={height}
            />
        </div>
    )
}
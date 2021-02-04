import { DOMWidgetModel, DOMWidgetView, ISerializers, WidgetModel } from '@jupyter-widgets/base';
import { MuiThemeProvider } from '@material-ui/core';
import React, { FunctionComponent, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../css/styles.css';
import '../css/widget.css';
import extensionContext from './extensionContext';
import { HitherContext } from './extensions/common/hither';
import { sleepMsec } from './extensions/common/misc';
import { Plugins, Recording, Sorting, WorkspaceInfo } from './extensions/extensionInterface';
import initializeHitherInterface from './extensions/initializeHitherInterface';
import theme from './extensions/theme';
import WorkspaceView from './extensions/WorkspaceView';
import { useInterval } from './misc';
import { MODULE_NAME, MODULE_VERSION } from './version';

export class WorkspaceViewJpModel extends DOMWidgetModel {
    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
    }

    defaults() {
        return {
            ...super.defaults(),
            _model_name: WorkspaceViewJpModel.model_name,
            _model_module: WorkspaceViewJpModel.model_module,
            _model_module_version: WorkspaceViewJpModel.model_module_version,
            _view_name: WorkspaceViewJpModel.view_name,
            _view_module: WorkspaceViewJpModel.view_module,
            _view_module_version: WorkspaceViewJpModel.view_module_version,
            feedUri: '',
            workspaceName: '',
            widgetHeight: 0
        };
    }

    static serializers: ISerializers = {
        ...DOMWidgetModel.serializers,
        // Add any extra serializers here
    };

    static model_name = 'WorkspaceViewJpModel';
    static model_module = MODULE_NAME;
    static model_module_version = MODULE_VERSION;
    static view_name = 'WorkspaceViewJp'; // Set to null if no view
    static view_module = MODULE_NAME; // Set to null if no view
    static view_module_version = MODULE_VERSION;
}

export class WorkspaceViewJp extends DOMWidgetView {
    // _hitherJobManager: HitherJobManager
    initialize() {
        // this._hitherJobManager = new HitherJobManager(this.model)
    }
    element() {
        const feedUri = this.model.get('feedUri')
        const workspaceName = this.model.get('workspaceName')

        // this code is duplicated /////////////////////////
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
        /////////////////////////////////////////////////////

        const workspaceInfo = {
            workspaceName,
            feedUri,
            readOnly: false
        }

        return (
            <MuiThemeProvider theme={theme}>
                <HitherContext.Provider value={hither}>
                    <Wrapper
                        model={this.model}
                        workspaceInfo={workspaceInfo}
                        sortings={[]}
                        recordings={[]}
                        plugins={plugins}
                    />
                </HitherContext.Provider>
            </MuiThemeProvider>
        )
    }
    render() {
        const x = this.element()
        const widgetHeight = this.model.get('widgetHeight')
        const style = this.el.style as { [key: string]: any }
        style.height = '100%'
        style['min-height'] = `${widgetHeight || 500}px`
        ReactDOM.render(x, this.el)
    }
}

interface WrapperProps {
    model: WidgetModel
    plugins: Plugins
    workspaceInfo: WorkspaceInfo
    sortings: Sorting[]
    recordings: Recording[]
}

const Wrapper: FunctionComponent<WrapperProps> = ({ plugins, model, workspaceInfo, sortings, recordings }) => {

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

    return (
        <div ref={divRef} className="WorkspaceViewJpWrapper" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <WorkspaceView
                workspaceInfo={workspaceInfo}
                serverInfo={{}}
                sortings={sortings}
                recordings={recordings}
                plugins={plugins}
                onDeleteRecordings={(recordingIds: string[]) => {}}
                width={500}
                height={500}
            />
        </div>
    )
}
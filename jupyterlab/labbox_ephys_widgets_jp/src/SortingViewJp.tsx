import { DOMWidgetModel, DOMWidgetView, ISerializers } from '@jupyter-widgets/base';
import { MuiThemeProvider } from '@material-ui/core';
import React from 'react';
import ReactDOM from 'react-dom';
import '../css/styles.css';
import '../css/widget.css';
import extensionContext from './extensionContext';
import { createCalculationPool, HitherContext } from './extensions/common/hither';
import { filterPlugins, Plugins } from './extensions/extensionInterface';
import theme from './extensions/theme';
import initializeHitherForJpWidgetView from './initializeHitherForJpWidgetView';
import SortingViewPluginComponentWrapper from './SortingViewPluginComponentWrapper';
import { MODULE_NAME, MODULE_VERSION } from './version';

const calculationPool = createCalculationPool({ maxSimultaneous: 6 })

export class SortingViewJp extends DOMWidgetView {
    // _hitherJobManager: HitherJobManager
    _cleanupCallbacks: (() => void)[] = []
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

        const {hither, cleanup} = initializeHitherForJpWidgetView(this.model)
        this._cleanupCallbacks.push(cleanup)

        const plugins: Plugins = {
            recordingViews: extensionContext._recordingViewPlugins,
            sortingViews: extensionContext._sortingViewPlugins,
            sortingUnitViews: extensionContext._sortingUnitViewPlugins,
            sortingUnitMetrics: extensionContext._sortingUnitMetricPlugins
        }

        return (
            <MuiThemeProvider theme={theme}>
                <HitherContext.Provider value={hither}>
                    <SortingViewPluginComponentWrapper
                        plugin={plugin}
                        sortingObject={sortingObject}
                        recordingObject={recordingObject}
                        sortingInfo={sortingInfo}
                        recordingInfo={recordingInfo}
                        plugins={filterPlugins(plugins)}
                        calculationPool={calculationPool}
                        model={this.model}
                        curationUri={curationUri}
                        onClose={cleanup}
                    />
                </HitherContext.Provider>
            </MuiThemeProvider>
        )
    }
    render() {
        const reactElement = this.element()

        const pluginName = this.model.get('pluginName')
        const widgetHeight = this.model.get('widgetHeight')

        const plugin = extensionContext._sortingViewPlugins[pluginName]
        if (!plugin) throw Error(`Plugin not found: ${pluginName}`)

        this.el.classList.add('plugin-' + pluginName)

        renderJpWidget(this, reactElement, widgetHeight || plugin.notebookCellHeight || 500)
    }
    remove() {
        this._cleanupCallbacks.forEach(cb => cb())
    }
}

const renderJpWidget = (W: DOMWidgetView, reactElement: JSX.Element, widgetHeight: number) => {
    const style = W.el.style as { [key: string]: any }
    style.height = '100%'
    style['min-height'] = `${widgetHeight}px`
    ReactDOM.render(reactElement, W.el)
}

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
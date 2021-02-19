import { DOMWidgetModel, DOMWidgetView, ISerializers } from '@jupyter-widgets/base';
import { MuiThemeProvider } from '@material-ui/core';
import { LabboxProvider } from 'labbox';
import React from 'react';
import ReactDOM from 'react-dom';
import '../css/styles.css';
import '../css/widget.css';
import extensionContext from './extensionContext';
import { WorkspaceInfo } from './extensions/pluginInterface';
import theme from './extensions/theme';
import { MODULE_NAME, MODULE_VERSION } from './version';
import WorkspaceViewWrapper from './WorkspaceViewWrapper';

export class WorkspaceViewJp extends DOMWidgetView {
    // _hitherJobManager: HitherJobManager
    _status = {active: true}
    initialize() {
        // this._hitherJobManager = new HitherJobManager(this.model)
    }
    element() {
        const feedUri = this.model.get('feedUri')
        const workspaceName = this.model.get('workspaceName')

        const workspaceInfo: WorkspaceInfo = {
            workspaceName,
            feedUri,
            readOnly: false
        }

        const apiConfig = {
            webSocketUrl: '',
            baseSha1Url: `/sha1`,
            baseFeedUrl: `/feed`,
            jupyterMode: true,
            jupyterModel: this.model
        }

        return (
            <MuiThemeProvider theme={theme}>
                <LabboxProvider extensionContext={extensionContext} apiConfig={apiConfig} status={this._status}>
                    <WorkspaceViewWrapper
                        workspaceInfo={workspaceInfo}
                        model={this.model}
                    />
                </LabboxProvider>
            </MuiThemeProvider>
        )
    }
    render() {
        const reactElement = this.element()

        const widgetHeight = 700

        this.el.classList.add('WorkspaceViewJp')

        renderJpWidget(this, reactElement, widgetHeight)
    }
    remove() {
        this._status.active = false
    }
}

const renderJpWidget = (W: DOMWidgetView, reactElement: JSX.Element, widgetHeight: number) => {
    const style = W.el.style as { [key: string]: any }
    style.height = '100%'
    style['min-height'] = `${widgetHeight}px`
    ReactDOM.render(reactElement, W.el)
}

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
            workspaceName: ''
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
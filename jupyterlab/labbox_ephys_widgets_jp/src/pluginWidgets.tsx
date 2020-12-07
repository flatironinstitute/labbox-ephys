// Copyright (c) Jeremy Magland
// Distributed under the terms of the Modified BSD License.

// Import the CSS
import { DOMWidgetModel, DOMWidgetView, ISerializers } from '@jupyter-widgets/base';
import React from 'react';
import ReactDOM from 'react-dom';
import '../css/widget.css';
import { activate as activateelectrodegeometry } from './extensions/electrodegeometry/electrodegeometry';
import { ExtensionContext, HitherContext, HitherJob, HitherJobOpts, Recording, RecordingViewPlugin, Sorting, SortingUnitMetricPlugin, SortingUnitViewPlugin, SortingViewPlugin } from './extensions/extensionInterface';
import { MODULE_NAME, MODULE_VERSION } from './version';

console.log('--- testAB')

const registerExtensions = (context: ExtensionContext) => {
  // activatecorrelogram(context)
  // activateexample(context)
  // activatedevel(context)
  activateelectrodegeometry(context)
  // activatetimeseries(context)
  // activateaveragewaveforms(context)
  // // activatepythonsnippets(context)
  // activateunitstable(context)
}

class LEJExtensionContext {
  _sortingViewPlugins: {[key: string]: SortingViewPlugin} = {}
  constructor() {}
  registerSortingView(V: SortingViewPlugin) {
    this._sortingViewPlugins[V.name] = V
  }
  unregisterSortingView(name: string) {

  }
  registerSortingUnitView(V: SortingUnitViewPlugin) {

  }
  unregisterSortingUnitView(name: string) {

  }
  registerRecordingView(V: RecordingViewPlugin) {

  }
  unregisterRecordingView(name: string) {

  }
  registerSortingUnitMetric(M: SortingUnitMetricPlugin) {

  }
  unregisterSortingUnitMetric(name: string) {

  }
}

const extensionContext = new LEJExtensionContext()
registerExtensions(extensionContext)

console.log('---- plugins')
console.log(Object.keys(extensionContext._sortingViewPlugins))

export class SortingViewModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: SortingViewModel.model_name,
      _model_module: SortingViewModel.model_module,
      _model_module_version: SortingViewModel.model_module_version,
      _view_name: SortingViewModel.view_name,
      _view_module: SortingViewModel.view_module,
      _view_module_version: SortingViewModel.view_module_version
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'SortingViewModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'SortingView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class SortingView extends DOMWidgetView {
  element() {
    const p = extensionContext._sortingViewPlugins['ElectrodeGeometrySortingView']
    if (!p) return <div>plugin is null</div>

    const sorting: Sorting = {
      sortingId: 'sortingId',
      sortingLabel: 'sortingLabel',
      sortingPath: 'sortingPath',
      sortingObject: {},
      recordingId: 'recordingId',
      recordingPath: 'recordingPath',
      recordingObject: {}
    }
    const recording: Recording = {
      recordingId: 'recordingId',
      recordingLabel: 'recordingLabel',
      recordingObject: {},
      recordingPath: 'recordingPath',
      recordingInfo: {
        sampling_frequency: 30000,
        channel_ids: [0, 1, 2],
        channel_groups: [],
        geom: [[0, 0], [10, 20], [10, 5]],
        num_frames: 100000
      }
    }
    const hitherContext: HitherContext = {
      createHitherJob: (functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts): HitherJob => {throw Error('Error')}
    }

    // this.el.textContent = this.model.get('value') + ' --- test9';
    const x = (
      <div>
        Sorting view
        {
          <p.component
            sorting={sorting}
            recording={recording}
            selectedUnitIds={{}}
            focusedUnitId={null}
            onUnitClicked={(unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => {}}
            onAddUnitLabel={(a: {
                sortingId: string;
                unitId: number;
                label: string;
            }) => {}}
            onRemoveUnitLabel={(a: {
                sortingId: string;
                unitId: number;
                label: string;
            }) => {}}
            onSelectedUnitIdsChanged={(selectedUnitIds: {[key: string]: boolean}) => {}}
            readOnly={true}
            sortingUnitViews={{}}
            sortingUnitMetrics={{}}
            hither={hitherContext}
          />
        }
      </div>
    )
    return x
  }
  render() {
    this.el.classList.add('custom-widget');

    const x = this.element()
    ReactDOM.render(x, this.el)
  }
}


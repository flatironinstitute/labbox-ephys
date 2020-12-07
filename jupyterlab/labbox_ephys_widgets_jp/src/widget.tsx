// Copyright (c) Jeremy Magland
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers
} from '@jupyter-widgets/base';
import React from 'react';
import ReactDOM from 'react-dom';
// Import the CSS
import '../css/widget.css';
import ElectrodeGeometryWidget from './extensions/electrodegeometry/ElectrodeGeometryWidget/ElectrodeGeometryWidget';
import RaindropWidget from './raindrop';
import { MODULE_NAME, MODULE_VERSION } from './version';
console.log('--- react', React)

export class ExampleModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ExampleModel.model_name,
      _model_module: ExampleModel.model_module,
      _model_module_version: ExampleModel.model_module_version,
      _view_name: ExampleModel.view_name,
      _view_module: ExampleModel.view_module,
      _view_module_version: ExampleModel.view_module_version,
      value: 'Hello World',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'ExampleModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ExampleView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class ExampleView extends DOMWidgetView {
  render() {
    this.el.classList.add('custom-widget');

    this.value_changed();
    this.model.on('change:value', this.value_changed, this);
  }

  value_changed() {
    // this.el.textContent = this.model.get('value') + ' --- test9';
    const x = (
      <div>
        Test3
        <RaindropWidget />
        <ElectrodeGeometryWidget
          electrodes={[{label: '0', x: 0, y: 0}, {label: '1', x: 5, y: 5}]}
          selectedElectrodeIds={[]}
          onSelectedElectrodeIdsChanged={() => {console.log('dummy')}}
          width={300}
          height={300}
        />
      </div>
    )
    ReactDOM.render(x, this.el)
  }
}


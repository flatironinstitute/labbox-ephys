// Copyright (c) Jeremy Magland
// Distributed under the terms of the Modified BSD License.

// Import the CSS
import { DOMWidgetModel, DOMWidgetView, ISerializers, WidgetModel } from '@jupyter-widgets/base';
import React, { FunctionComponent, useEffect, useReducer, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import '../css/widget.css';
import { CalculationPool, createCalculationPool, HitherContext } from './extensions/common/hither';
import { sleepMsec } from './extensions/common/misc';
import { externalUnitMetricsReducer, filterPlugins, Plugins, Recording, RecordingViewPlugin, Sorting, sortingCurationReducer, sortingSelectionReducer, SortingUnitMetricPlugin, SortingUnitViewPlugin, SortingViewPlugin, useRecordingAnimation } from './extensions/extensionInterface';
import initializeHitherInterface from './extensions/initializeHitherInterface';
import registerExtensions from './registerExtensions';
import { MODULE_NAME, MODULE_VERSION } from './version';


class LEJExtensionContext {
  _recordingViewPlugins: {[key: string]: RecordingViewPlugin} = {}
  _sortingViewPlugins: {[key: string]: SortingViewPlugin} = {}
  _sortingUnitViewPlugins: {[key: string]: SortingUnitViewPlugin} = {}
  _sortingUnitMetricPlugins: {[key: string]: SortingUnitMetricPlugin} = {}
  constructor() {}
  registerRecordingView(V: RecordingViewPlugin) {
    this._recordingViewPlugins[V.name] = V
  }
  unregisterRecordingView(name: string) {

  }
  registerSortingView(V: SortingViewPlugin) {
    this._sortingViewPlugins[V.name] = V
  }
  unregisterSortingView(name: string) {

  }
  registerSortingUnitView(V: SortingUnitViewPlugin) {
    this._sortingUnitViewPlugins[V.name] = V
  }
  unregisterSortingUnitView(name: string) {

  }
  registerSortingUnitMetric(M: SortingUnitMetricPlugin) {
    this._sortingUnitMetricPlugins[M.name] = M
  }
  unregisterSortingUnitMetric(name: string) {

  }
}

const extensionContext = new LEJExtensionContext()
registerExtensions(extensionContext)

// class HitherJobManager {
//   _activeJobs: {[key: string]: any} = {}
//   _jobFinishedCallbacks: {[key: string]: (result: any, runtime_info: any) => void} = {}
//   _jobErrorCallbacks: {[key: string]: (error_message: string, runtime_info: any) => void} = {}
//   _iterating: boolean = false
//   constructor(private model: DOMWidgetModel) {
//     model.on('msg:custom', (msg: any) => {
//       if (msg.type === 'hitherJobFinished') {
//         const clientJobId = msg.client_job_id
//         if (this._activeJobs[clientJobId]) {
//           delete this._activeJobs[clientJobId]
//           const url = `/sha1/${msg.result_sha1}`
//           axios.get(url).then((result) => {
//             const x = processHitherJobResult(result.data)
//             const cb = this._jobFinishedCallbacks[clientJobId]
//             if (cb) {
//               cb(x, msg.runtime_info)
//             }
//           })
//           .catch((err: Error) => {
//             const cb = this._jobErrorCallbacks[clientJobId]
//             if (cb) {
//               cb(`Problem retrieving result: ${err.message}`, msg.runtime_info)
//             }
//           })
//         }
//       }
//       else if (msg.type === 'hitherJobError') {
//         const clientJobId = msg.client_job_id
//         const cb = this._jobErrorCallbacks[msg.client_job_id]
//         if (cb) {
//           cb(msg.error_message, msg.runtime_info)
//         }
//         delete this._activeJobs[clientJobId]
//       }
//       else if (msg.type === 'debug') {
//         console.info('DEBUG MESSAGE', msg)
//       }
//     })
//   }
//   sendMessage(msg: {[key: string]: any}) {
//     this.model.send(msg, {})
//   }
//   createHitherJob(functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts) {
//     const clientJobId: string = randomAlphaId()
//     let localJob: HitherJob = {
//       jobId: null,
//       functionName,
//       kwargs,
//       opts,
//       clientJobId,
//       result: null,
//       runtime_info: {},
//       error_message: null,
//       status: '',
//       timestampStarted: 0,
//       timestampFinished: null,
//       clientCancelled: false,
//       wait: async () => {}, // this will be replaced below
//       cancel: () => {} // replaced below
//     }
//     let localOnFinished: ((result: any) => void) | null = null
//     let localOnError: ((error_message: string) => void) | null = null
//     this._jobFinishedCallbacks[clientJobId] = (result: any, runtime_info: any) => {
//       localJob.result = result
//       localJob.runtime_info = runtime_info
//       if (localOnFinished) localOnFinished(result)
//     }
//     this._jobErrorCallbacks[clientJobId] = (error_message: string, runtime_info: any) => {
//       localJob.error_message = error_message
//       localJob.runtime_info = runtime_info
//       if (localOnError) localOnError(error_message)
//     }
//     this.model.send({type: 'hitherCreateJob', functionName, kwargs, clientJobId}, {})
//     const _wait = () => {
//       return new Promise((resolve, reject) => {
//         if (localJob.result) {
//           resolve(localJob.result)
//           return
//         }
//         if (localJob.error_message) {
//           reject(new Error(localJob.error_message))
//           return
//         }
//         localOnFinished = (result: any) => {
//           resolve(result)
//         }
//         localOnError = (error_message: string) => {
//           reject(new Error(error_message))
//         }
//       })
//     }
//     localJob.wait = _wait
//     localJob.cancel = () => {localJob.clientCancelled = true} // todo - do more than this?
//     this._activeJobs[clientJobId] = localJob
//     this._startIterating()
//     return localJob
//   }
//   _startIterating() {
//     if (this._iterating) return
//     this._iterating = true
//     ;(async () => {
//       while (true) {
//         if (Object.values(this._activeJobs).length === 0) {
//           this._iterating = false
//           return
//         }
//         this.model.send({type: 'iterate'}, {})
//         await sleepMsec(3000)
//       }
//     })()
//   }
// }

export class SortingViewModel extends DOMWidgetModel {
  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
  }

  defaults() {
    return {
      ...super.defaults(),
      _model_name: SortingViewModel.model_name,
      _model_module: SortingViewModel.model_module,
      _model_module_version: SortingViewModel.model_module_version,
      _view_name: SortingViewModel.view_name,
      _view_module: SortingViewModel.view_module,
      _view_module_version: SortingViewModel.view_module_version,
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

  static model_name = 'SortingViewModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'SortingView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
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
}

const PluginComponentWrapper: FunctionComponent<PluginComponentWrapperProps> = ({plugin, sortingObject, recordingObject, sortingInfo, recordingInfo, plugins, calculationPool, model}) => {
  const [sorting, setSorting] = useState<Sorting | null>(null)
  const [recording, setRecording] = useState<Recording | null>(null)

  // curation
  const [curation, curationDispatch] = useReducer(sortingCurationReducer, model.get('curation'))
  useEffect(() => {
    if (model.get('curation') !== curation) {
      model.set('curation', curation)
      model.save_changes()
    }
  }, [curation, model])
  useEffect(() => {
    model.on('change:curation', () => {
      curationDispatch({
        type: 'SetCuration',
        curation: model.get('curation')
      })
    }, null)
  }, [model])

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
      sortingInfo,
      curation,
      externalUnitMetrics
    })
    setRecording({
      recordingId: '',
      recordingLabel: '',
      recordingObject,
      recordingPath: '',
      recordingInfo
    })
  }, [setSorting, sortingObject, recordingObject, sortingInfo, recordingInfo, curation, externalUnitMetrics])

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
        const newTimeRange = {min: 0, max: Math.min(recordingInfo.num_frames, Math.floor(recordingInfo.sampling_frequency / 10))}
        selectionDispatch({type: 'SetTimeRange', timeRange: newTimeRange})
      }
    }
  }, [recordingInfo, selection.timeRange])

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
  
  return (
    <div ref={divRef} className="PluginComponentWrapper" style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}>
      <plugin.component
        sorting={sorting}
        recording={recording}
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

// thanks: https://usehooks-typescript.com/react-hook/use-interval
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void | null>()
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  })
  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (typeof savedCallback?.current !== 'undefined') {
        savedCallback?.current()
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

export class SortingView extends DOMWidgetView {
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
        this.model.send({type: 'iterate'}, {})
        return
      }
      _iterating = true
      ;(async () => {
        while (true) {
          if (hither.getNumActiveJobs() === 0) {
            _iterating = false
            return
          }
          this.model.send({type: 'iterate'}, {})
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
        />
      </HitherContext.Provider>
    )
  }
  render() {
    const pluginName = this.model.get('pluginName')
    const plugin = extensionContext._sortingViewPlugins[pluginName]
    if (!plugin) throw Error(`Plugin not found: ${pluginName}`)

    this.el.classList.add('plugin-' + pluginName)
    const x = this.element()
    this.el.style.height = '100%'
    this.el.style['min-height'] = `${plugin.notebookCellHeight || 500}px`
    ReactDOM.render(x, this.el)
  }
}

// export class RecordingViewModel extends DOMWidgetModel {
//   initialize(attributes: any, options: any) {
//     super.initialize(attributes, options);
//   }

//   defaults() {
//     return {
//       ...super.defaults(),
//       _model_name: RecordingViewModel.model_name,
//       _model_module: RecordingViewModel.model_module,
//       _model_module_version: RecordingViewModel.model_module_version,
//       _view_name: RecordingViewModel.view_name,
//       _view_module: RecordingViewModel.view_module,
//       _view_module_version: RecordingViewModel.view_module_version,
//       pluginName: '',
//       recordingObject: {}
//     };
//   }

//   static serializers: ISerializers = {
//     ...DOMWidgetModel.serializers,
//     // Add any extra serializers here
//   };

//   static model_name = 'RecordingViewModel';
//   static model_module = MODULE_NAME;
//   static model_module_version = MODULE_VERSION;
//   static view_name = 'RecordingView'; // Set to null if no view
//   static view_module = MODULE_NAME; // Set to null if no view
//   static view_module_version = MODULE_VERSION;
// }

// export class RecordingView extends DOMWidgetView {
//   _hitherJobManager: HitherJobManager
//   initialize() {
//     this._hitherJobManager = new HitherJobManager(this.model)
//   }
//   element() {
//     const pluginName = this.model.get('pluginName')
//     const recordingObject = this.model.get('recordingObject')
//     const recordingInfo = this.model.get('recordingInfo')
//     const plugin = extensionContext._recordingViewPlugins[pluginName]
//     if (!plugin) return <div>Plugin not found: {pluginName}</div>

//     const example = exampleSorting()

//     const HitherInterface: HitherInterface = {
//       createHitherJob: (functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts): HitherJob => {
//         return this._hitherJobManager.createHitherJob(functionName, kwargs, opts)
//       }
//     }

//     const recording = {
//       recordingId: '',
//       recordingLabel: '',
//       recordingObject,
//       recordingPath: '',
//       recordingInfo
//     }

//     const plugins: Plugins = {
//       recordingViews: extensionContext._recordingViewPlugins,
//       sortingViews: extensionContext._sortingViewPlugins,
//       sortingUnitViews: extensionContext._sortingUnitViewPlugins,
//       sortingUnitMetrics: extensionContext._sortingUnitMetricPlugins
//     }

//     // this.el.textContent = this.model.get('value') + ' --- test9';
//     const x = (
//       <plugin.component
//         recording={recording}
//         plugins={plugins}
//         calculationPool={calculationPool}
//         recordingSelection={{}}
//         recordingSelectionDispatch={(a: RecordingSelectionAction) => {}}
//       />
//     )
//     return x
//   }
//   render() {
//     // this.el.classList.add('custom-widget');

//     const x = this.element()
//     ReactDOM.render(x, this.el)
//   }
// }

function randomAlphaId() {
  const num_chars = 10;
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let text = "";
  for (let i = 0; i < num_chars; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

// export const getSortingViewPluginWidgets = () => {
//   const ret: {
//     name: string,
//     model: typeof DOMWidgetModel,
//     view: typeof DOMWidgetView
//   }[] = []

//   Object.values(extensionContext._sortingViewPlugins).forEach(p => {
//     console.log('Loading sorting view: ' + p.name)
//     ret.push(createSortingViewPluginWidget(p))
//   })

//   return ret
// }




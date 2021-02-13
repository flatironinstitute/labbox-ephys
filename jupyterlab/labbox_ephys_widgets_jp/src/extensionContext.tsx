import { RecordingViewPlugin, SortingUnitMetricPlugin, SortingUnitViewPlugin, SortingViewPlugin } from './extensions/pluginInterface';
import registerExtensions from './registerExtensions';

class LEJExtensionContext {
    _recordingViewPlugins: {[key: string]: RecordingViewPlugin} = {}
    _sortingViewPlugins: {[key: string]: SortingViewPlugin} = {}
    _sortingUnitViewPlugins: {[key: string]: SortingUnitViewPlugin} = {}
    _sortingUnitMetricPlugins: {[key: string]: SortingUnitMetricPlugin} = {}
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

  export default extensionContext
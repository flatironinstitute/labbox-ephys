// Copyright (c) Jeremy Magland
// Distributed under the terms of the Modified BSD License.

import { ExportData, IJupyterWidgetRegistry } from '@jupyter-widgets/base';
import { Application, IPlugin } from '@phosphor/application';
import { Widget } from '@phosphor/widgets';
import { RecordingView, RecordingViewModel, SortingView, SortingViewModel } from './pluginWidgets';
import { MODULE_NAME, MODULE_VERSION } from './version';

const EXTENSION_ID = 'labbox_ephys_widgets_jp:plugin';

/**
 * The example plugin.
 */
const examplePlugin: IPlugin<Application<Widget>, void> = ({
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateWidgetExtension,
  autoStart: true,
} as unknown) as IPlugin<Application<Widget>, void>;
// the "as unknown as ..." typecast above is solely to support JupyterLab 1
// and 2 in the same codebase and should be removed when we migrate to Lumino.

export default examplePlugin;

const exports: ExportData = {SortingView, SortingViewModel, RecordingView, RecordingViewModel}

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(
  app: Application<Widget>,
  registry: IJupyterWidgetRegistry
): void {
  registry.registerWidget({
    name: MODULE_NAME,
    version: MODULE_VERSION,
    exports
  });  
}

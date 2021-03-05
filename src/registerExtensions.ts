// This file was automatically generated. Do not edit directly. See devel/templates.

import { LabboxExtensionContext } from './python/labbox_ephys/extensions/pluginInterface'

////////////////////////////////////////////////////////////////////////////////////
// The list of extensions is configured in devel/code_generation.yaml
import { activate as activate_mainwindow } from './python/labbox_ephys/extensions/mainwindow/mainwindow'
import { activate as activate_workspaceview } from './python/labbox_ephys/extensions/workspaceview/workspaceview'
////////////////////////////////////////////////////////////////////////////////////

const registerExtensions = (context: LabboxExtensionContext) => {
    ////////////////////////////////////////////////////////////////////////////////
    // The list of extensions is configured in devel/code_generation.yaml
    activate_mainwindow(context)
    activate_workspaceview(context)
    ////////////////////////////////////////////////////////////////////////////////
}

export default registerExtensions

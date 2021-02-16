import { createExtensionContext } from './extensions/labbox';
import { LabboxPlugin } from './extensions/pluginInterface';
import registerExtensions from './registerExtensions';
  
const extensionContext = createExtensionContext<LabboxPlugin>()
registerExtensions(extensionContext)

export default extensionContext
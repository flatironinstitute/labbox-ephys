import { ExtensionContext } from "./extension"
import { activate as activateAutocorrelograms } from './pluginComponents/AutoCorrelograms/AutoCorrelograms'

const registerExtensions = (context: ExtensionContext) => {
    activateAutocorrelograms(context)
}

export default registerExtensions
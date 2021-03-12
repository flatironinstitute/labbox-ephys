
import { {{ classPrefix }}ExtensionContext } from './python/{{ projectNameUnderscore }}/extensions/pluginInterface'

const registerExtensions = async (context: {{ classPrefix }}ExtensionContext) => {
    {% for extension in extensions -%}
    const {activate: activate_{{ extension.name }}} = await import('./python/{{ projectNameUnderscore }}/extensions/{{ extension.relPath }}')
    activate_{{ extension.name }}(context)
    {% endfor -%}
}

export default registerExtensions
import { {{ classPrefix }}ExtensionContext } from './python/{{ projectNameUnderscore }}/extensions/pluginInterface'

////////////////////////////////////////////////////////////////////////////////////
// The list of extensions is configured in devel/code_generation.yaml
{% for extension in extensions -%}
import { activate as activate_{{ extension.name }} } from './python/{{ projectNameUnderscore }}/extensions/{{ extension.relPath }}'
{% endfor -%}
////////////////////////////////////////////////////////////////////////////////////

const registerExtensions = (context: {{ classPrefix }}ExtensionContext) => {
    ////////////////////////////////////////////////////////////////////////////////
    // The list of extensions is configured in devel/code_generation.yaml
    {% for extension in extensions -%}
    activate_{{ extension.name }}(context)
    {% endfor -%}
    ////////////////////////////////////////////////////////////////////////////////
}

export default registerExtensions

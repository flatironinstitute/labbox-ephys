import { createContext, FunctionComponent, useContext } from 'react';
export { createCalculationPool, HitherContext } from './hither';
export type { CalculationPool } from './hither';

export interface BasePlugin {
    type: string
    name: string
    label: string
}

export interface BaseViewPlugin extends BasePlugin {
    component: React.FunctionComponent<any>
    icon: any
}

export interface ExtensionContext<Plugin extends BasePlugin> {
    registerPlugin: (p: Plugin) => void
}

class ExtensionContextImpl<Plugin extends BasePlugin> {
    #plugins: Plugin[] = []
    registerPlugin(p: Plugin) {
        this.#plugins.push(p)
    }
    plugins() {
        return [...this.#plugins]
    }
}

const PluginsContext = createContext<{plugins: BasePlugin[]}>({plugins: []})

export const LabboxProvider: FunctionComponent<{children: React.ReactNode, extensionContext: ExtensionContextImpl<any>}> = ({children, extensionContext}) => {
    return (
        <PluginsContext.Provider value={{plugins: extensionContext.plugins()}}>
            {children}
        </PluginsContext.Provider>
    )
}

export const createExtensionContext = <Plugin extends BasePlugin>() => {
    return new ExtensionContextImpl<Plugin>()
}

export const useLabboxPlugins = <Plugin extends BasePlugin>(): Plugin[] => {
    const {plugins} = useContext(PluginsContext)
    return plugins as any as Plugin[] // todo: think about using typeguards or something here. Otherwise we just rely on user to be careful.
}
import { useContext } from 'react';
import { ExtensionContextImpl, LabboxProviderContext } from './LabboxProvider';
export { createCalculationPool, HitherContext } from './hither';
export type { CalculationPool } from './hither';
export { default as usePlugins } from './usePlugins';

export interface WorkspaceInfo {
    workspaceName: string | null
    feedUri: string | null
    readOnly: boolean | null
}

export interface BasePlugin {
    type: string
    name: string
    label: string
}

export interface ExtensionContext<Plugin extends BasePlugin> {
    registerPlugin: (p: Plugin) => void
}

export const createExtensionContext = <Plugin extends BasePlugin>() => {
    return new ExtensionContextImpl<Plugin>()
}

export const useLabboxPlugins = <Plugin extends BasePlugin>(): Plugin[] => {
    const {plugins} = useContext(LabboxProviderContext)
    return plugins as any as Plugin[] // todo: think about using typeguards or something here. Otherwise we just rely on user to be careful.
}
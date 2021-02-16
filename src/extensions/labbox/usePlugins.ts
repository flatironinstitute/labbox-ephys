import { useContext } from "react"
import { BasePlugin } from "."
import { LabboxProviderContext } from "./LabboxProvider"

const usePlugins = <Plugin extends BasePlugin>() => {
    const { plugins } = useContext(LabboxProviderContext)
    return plugins as any as Plugin[]
}

export default usePlugins
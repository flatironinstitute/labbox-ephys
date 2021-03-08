// This file was automatically generated. Do not edit directly.


import { LabboxExtensionContext } from './python/labbox_ephys/extensions/pluginInterface'

const registerExtensions = async (context: LabboxExtensionContext) => {
    const {activate: activate_mainwindow} = await import('./python/labbox_ephys/extensions/mainwindow/mainwindow')
    activate_mainwindow(context)
    const {activate: activate_workspaceview} = await import('./python/labbox_ephys/extensions/workspaceview/workspaceview')
    activate_workspaceview(context)
    const {activate: activate_mountainview} = await import('./python/labbox_ephys/extensions/mountainview/mountainview')
    activate_mountainview(context)
    const {activate: activate_averagewaveforms} = await import('./python/labbox_ephys/extensions/averagewaveforms/averagewaveforms')
    activate_averagewaveforms(context)
    const {activate: activate_clusters} = await import('./python/labbox_ephys/extensions/clusters/clusters')
    activate_clusters(context)
    const {activate: activate_correlograms} = await import('./python/labbox_ephys/extensions/correlograms/correlograms')
    activate_correlograms(context)
    const {activate: activate_electrodegeometry} = await import('./python/labbox_ephys/extensions/electrodegeometry/electrodegeometry')
    activate_electrodegeometry(context)
    const {activate: activate_firetrack} = await import('./python/labbox_ephys/extensions/firetrack/firetrack')
    activate_firetrack(context)
    const {activate: activate_pythonsnippets} = await import('./python/labbox_ephys/extensions/pythonsnippets/pythonsnippets')
    activate_pythonsnippets(context)
    const {activate: activate_snippets} = await import('./python/labbox_ephys/extensions/snippets/snippets')
    activate_snippets(context)
    const {activate: activate_spikeamplitudes} = await import('./python/labbox_ephys/extensions/spikeamplitudes/spikeamplitudes')
    activate_spikeamplitudes(context)
    const {activate: activate_timeseries} = await import('./python/labbox_ephys/extensions/timeseries/timeseries')
    activate_timeseries(context)
    const {activate: activate_unitstable} = await import('./python/labbox_ephys/extensions/unitstable/unitstable')
    activate_unitstable(context)
    }

export default registerExtensions
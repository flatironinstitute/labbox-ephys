import { WidgetModel } from '@jupyter-widgets/base';
import React, { FunctionComponent, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppendOnlyLog, useFeedReducer } from './extensions/common/useFeedReducer';
import { useRecordingInfo } from './extensions/common/useRecordingInfo';
import { useSortingInfo } from './extensions/common/useSortingInfo';
import { sortingCurationReducer, SortingCurationWorkspaceAction } from './extensions/common/workspaceReducer';
import { CalculationPool } from './extensions/labbox/hither';
import { externalUnitMetricsReducer, Plugins, Recording, Sorting, SortingCuration, sortingSelectionReducer, SortingViewPlugin, useRecordingAnimation } from './extensions/pluginInterface';

interface Props {
    plugin: SortingViewPlugin
    sortingObject: any
    recordingObject: any
    sortingInfo: any
    recordingInfo: any
    plugins: Plugins
    calculationPool: CalculationPool
    model: WidgetModel
    curationUri?: string
}

const SortingViewPluginComponentWrapper: FunctionComponent<Props> = ({ plugin, sortingObject, recordingObject, plugins, calculationPool, model, curationUri }) => {
    const [sorting, setSorting] = useState<Sorting | null>(null)
    const [recording, setRecording] = useState<Recording | null>(null)

    const sortingInfo = useSortingInfo(sorting?.sortingObject, sorting?.recordingObject)
    const recordingInfo = useRecordingInfo(recording?.recordingObject)

    // curation
    // const [curation, curationDispatch] = useReducer(sortingCurationReducer, model.get('curation'))
    const curationSubfeed: AppendOnlyLog | null = useMemo(() => (curationUri ? new Subfeed(model, curationUri) : null), [curationUri, model])
    const [curation, curationDispatch] = useFeedReducer<SortingCuration, SortingCurationWorkspaceAction>(sortingCurationReducer, curationSubfeed ? {} : model.get('curation'), curationSubfeed)
    useEffect(() => {
        if (model.get('curation') !== curation) {
            model.set('curation', curation)
            model.save_changes()
        }
    }, [curation, model])
    useEffect(() => {
        model.on('change:curation', () => {
            if (!curationSubfeed) {
                curationDispatch({
                    type: 'SET_CURATION',
                    curation: model.get('curation')
                })
            }
        }, null)
    }, [model, curationDispatch, curationSubfeed])

    // externalUnitMetrics
    const [externalUnitMetrics, externalUnitMetricsDispatch] = useReducer(externalUnitMetricsReducer, model.get('externalUnitMetrics') ? model.get('externalUnitMetrics') : [])
    useEffect(() => {
        if (model.get('externalUnitMetrics') !== externalUnitMetrics) {
            model.set('externalUnitMetrics', externalUnitMetrics)
            model.save_changes()
        }
    }, [externalUnitMetrics, model])
    useEffect(() => {
        model.on('change:externalUnitMetrics', () => {
            externalUnitMetricsDispatch({
                type: 'SetExternalUnitMetrics',
                externalUnitMetrics: model.get('externalUnitMetrics')
            })
        }, null)
    }, [model])

    useEffect(() => {
        setSorting({
            sortingId: '',
            sortingLabel: '',
            sortingPath: '',
            sortingObject,
            recordingId: '',
            recordingPath: '',
            recordingObject,
            curation,
            externalUnitMetrics
        })
        setRecording({
            recordingId: '',
            recordingLabel: '',
            recordingObject,
            recordingPath: ''
        })
    }, [setSorting, sortingObject, recordingObject, curation, externalUnitMetrics])

    // selection
    const [selection, selectionDispatch] = useReducer(sortingSelectionReducer, model.get('selection').selectedUnitIds ? model.get('selection') : {})
    useRecordingAnimation(selection, selectionDispatch)
    useEffect(() => {
        if (model.get('selection') !== selection) {
            model.set('selection', selection)
            model.save_changes()
        }
    }, [selection, model])
    useEffect(() => {
        model.on('change:selection', () => {
            selectionDispatch({
                type: 'SetSelection',
                selection: model.get('selection')
            })
        }, null)
    }, [model])

    // default time range
    useEffect(() => {
        if (recordingInfo) {
            if (!selection.timeRange) {
                const newTimeRange = { min: 0, max: Math.min(recordingInfo.num_frames, Math.floor(recordingInfo.sampling_frequency / 10)) }
                selectionDispatch({ type: 'SetTimeRange', timeRange: newTimeRange })
            }
        }
    }, [selection.timeRange, recordingInfo])

    const [divElement, setDivElement] = useState<HTMLDivElement | null>(null)
    const [width, setWidth] = useState<number | undefined>(undefined)
    const [height, setHeight] = useState<number | undefined>(undefined)
    const [pollIndex, setPollIndex] = useState(0)
    const divRef = React.useCallback((elmt: HTMLDivElement) => {
        // this should get called only once after the div has been written to the DOM
        // we set this div element so that it can be used below when we set the canvas
        // elements to the layers
        setDivElement(elmt)
    }, [])

    useEffect(() => {
        if (divElement) {
            if (width !== divElement.offsetWidth) {
                setWidth(divElement.offsetWidth)
            }
            if (height !== divElement.offsetHeight) {
                setHeight(divElement.offsetHeight)
            }
        }
    }, [divElement, width, height, setWidth, setHeight, pollIndex])

    useInterval(() => {
        setPollIndex(pollIndex + 1)
    }, 1000)

    if (!sorting) {
        return <div>No sorting</div>
    }
    if (!recording) {
        return <div>No recording</div>
    }
    if (!sortingInfo) {
        return <div>No sorting info</div>
    }
    if (!recordingInfo) {
        return <div>No recording info</div>
    }

    return (
        <div ref={divRef} className="PluginComponentWrapper" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <plugin.component
                sorting={sorting}
                sortingInfo={sortingInfo}
                recording={recording}
                recordingInfo={recordingInfo}
                curationDispatch={curationDispatch}
                selection={selection}
                selectionDispatch={selectionDispatch}
                readOnly={false}
                plugins={plugins}
                calculationPool={calculationPool}
                width={width}
                height={height}
            />
        </div>
    )
}

const parseSubfeedUri = (uri: string): {feedId: string, subfeedHash: string} => {
    // feed://<feed-id>/~<subfeed-hash>
    const vals = uri.split('/')
    if (vals[0] !== 'feed:') throw Error(`Problem with subfeed uri: ${uri}`)
    if (vals[1] !== '') throw Error(`Problem with subfeed uri: ${uri}`)
    const feedId = vals[2]
    if (!vals[3].startsWith('~')) throw Error(`Problem with subfeed uri: ${uri}`)
    const subfeedHash = vals[3].slice(1)
    return {feedId, subfeedHash}
  }
  
  class Subfeed {
    _messages: any[] = []
    _onMessageCallbacks: ((msg: any) => void)[] = []
    constructor(private model: WidgetModel, private uri: string) {
      const {feedId, subfeedHash} = parseSubfeedUri(uri)
      const watchName = randomAlphaId()
      model.send({type: 'addSubfeedWatch', watchName, feedUri: `feed://${feedId}`, subfeedName: `~${subfeedHash}`}, {})
      model.on('msg:custom', (msgs: any) => {
        for (let msg of msgs) {
          if (msg.type === 'subfeedMessage') {
            if (msg.watchName === watchName) {
              this._messages.push(msg.message)
              this._onMessageCallbacks.forEach(cb => cb(msg.message))
            }
          }
        }
      })
    }
    appendMessage(message: any) {
      const {feedId, subfeedHash} = parseSubfeedUri(this.uri)
      this.model.send({type: 'appendSubfeedMessage', feedUri: `feed://${feedId}`, subfeedName: `~${subfeedHash}`, message}, {})
    }
    allMessages() {
      return [...this._messages]
    }
    onMessage(cb: (msg: any) => void) {
      this._onMessageCallbacks.push(cb)
    }
}

// thanks: https://usehooks-typescript.com/react-hook/use-interval
function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void | null>()
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback
    })
    // Set up the interval.
    useEffect(() => {
      function tick() {
        if (typeof savedCallback?.current !== 'undefined') {
          savedCallback?.current()
        }
      }
      if (delay !== null) {
        const id = setInterval(tick, delay)
        return () => clearInterval(id)
      }
    }, [delay])
}

function randomAlphaId() {
    const num_chars = 10;
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default SortingViewPluginComponentWrapper
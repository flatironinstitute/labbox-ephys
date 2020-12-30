import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useEffect, useReducer, useState } from 'react'
import { SortingSelection, SortingViewProps } from "../../extensionInterface"
import useTimeseriesData, { TimeseriesData } from '../../timeseries/TimeseriesViewNew/useTimeseriesModel'

const FireTrackView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch, hither}) => {
    const handleStopAnimation = useCallback(( args) => {
        selectionDispatch({type: 'SetCurrentTimepointVelocity', velocity: 0})
    }, [ selectionDispatch ])
    const handleStartAnimation = useCallback(( args) => {
        selectionDispatch({type: 'SetCurrentTimepointVelocity', velocity: 200})
    }, [ selectionDispatch ])

    const timeseriesData = useTimeseriesData(recording.recordingObject, recording.recordingInfo, hither)
    return (
        <div>
            {
                selection.animation?.currentTimepointVelocity ? (
                    <button onClick={handleStopAnimation}>Stop animation</button>
                ) : (
                    <button onClick={handleStartAnimation}>Start animation</button>
                )
            }
            {
                timeseriesData && <Test {...{timeseriesData, selection}} />
            }
        </div>
    )
}

const updateIndexReducer = (state: number, action: {type: 'increment'}) => {
    return state + 1
}

const Test: FunctionComponent<{timeseriesData: TimeseriesData, selection: SortingSelection}> = ({ timeseriesData, selection }) => {
    const selectedElectrodeIds = selection.selectedElectrodeIds
    const [data, setData] = useState<{[key: string]: number}>({})
    const [updateIndex, updateIndexDispatch] = useReducer(updateIndexReducer, 0)

    useEffect(() => {
        const t = selection.currentTimepoint
        if ((t === undefined) || (!selectedElectrodeIds)) {
            setData({})
            return
        }
        const d: {[key: string]: number} = {}
        for (let eid of selectedElectrodeIds) {
            const x = timeseriesData.getChannelData(eid, Math.floor(t), Math.floor(t) + 1, 1)
            d[eid + ''] = x[0]
        }
        setData(d)
        const somethingMissing = (Object.values(d).filter(v => isNaN(v)).length > 0)
        if (somethingMissing) {
            setTimeout(() => {
                updateIndexDispatch({type: 'increment'})
            }, 500)
        }
    }, [timeseriesData, selection, selectedElectrodeIds, setData, updateIndex, updateIndexDispatch])
    return (
        <Table>
            <TableHead></TableHead>
            <TableBody>
                {
                    (selectedElectrodeIds || []).map(ch => (
                        <TableRow key={ch}>
                            <TableCell key="elec_id">{ch}</TableCell>
                            <TableCell>{data[ch + ''] || NaN}</TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}

export default FireTrackView
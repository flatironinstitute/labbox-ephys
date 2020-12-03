import { Checkbox, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPathQuery } from '../../../kachery';
import { DocumentInfo } from '../../../reducers/documentInfo';
import { Sorting } from '../../../reducers/sortings';
import { MetricPlugin } from './metricPlugins/common';

const getLabelsForUnitId = (unitId: number, sorting: Sorting) => {
    const unitCuration = sorting.unitCuration || {};
    return (unitCuration[unitId] || {}).labels || [];
}

const HeaderRow = React.memo((a: {plugins: MetricPlugin[], clearSorts: () => void, handleClick: (metricName: string) => void}) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_first" style={{ width: 0}} />
                <TableCell key="_unitIds" onClick={() => a.clearSorts()}><span>Unit ID</span></TableCell>
                <TableCell key="_labels"><span>Labels</span></TableCell>
                {
                    a.plugins.map(plugin => {
                        return (
                            <TableCell key={plugin.columnLabel + '_header'}
                                        onClick={() => a.handleClick(plugin.metricName)}>
                                <span title={plugin.tooltip}>{plugin.columnLabel}</span>
                            </TableCell>
                        );
                    })
                }
            </TableRow>
        </TableHead>
    );
});

const UnitCheckbox = React.memo((a: {unitKey: string, selected: boolean, handleClicked: (unitId: number) => void}) => {
    return (
        <TableCell>
            <Checkbox
                checked={a.selected}
                onClick={() => a.handleClicked(Number(a.unitKey))}
            />
        </TableCell>
    );
});

const UnitIdCell = React.memo((a: {id: string, documentId: string, sortingId: string, feedUri: string}) => {
    const elmt = (
        <Link to={`/${a.documentId}/sortingUnit/${a.sortingId}/${a.id}/${getPathQuery({feedUri: a.feedUri})}`}>
            {a.id}
        </Link>
    )
    return <TableCell><span>{elmt}</span></TableCell>
})

const UnitLabelCell = React.memo((a: {labels: string}) => (
    <TableCell><span>{a.labels}</span></TableCell>
));

const MetricCell = React.memo((a: {title?: string, error: string, data: any, PayloadComponent: React.ComponentType<{record: any}>}) => {
    const { error, data, PayloadComponent } = a
    if (error !== '') {
        return (<TableCell><span>{`Error: ${error}`}</span></TableCell>);
    }
    if (data === null || data === '') { // 0 is a valid value!!
        return (<TableCell><LinearProgress style={{'width': '60%'}}/></TableCell>);
    } else {
        return (
            <TableCell>
                <span title={a.title}>
                    <PayloadComponent record = {data} />
                </span>
            </TableCell>
        );
    }
});


interface Props {
    metricPlugins: MetricPlugin[]
    units: number[]
    metrics: {[key: string]: {data: {[key: string]: number}, error: string | null}}
    selectedUnitIds: {[key: string]: boolean}
    sorting: Sorting
    onSelectedUnitIdsChanged: (s: {[key: string]: boolean}) => void
    documentInfo: DocumentInfo
}

const toggleSelectedUnitId = (selectedUnitIds: {[key: string]: boolean}, unitId: number): {[key: string]: boolean} => {
    return {
        ...selectedUnitIds,
        [unitId + '']: !(selectedUnitIds[unitId + ''] || false)
    }
}

type sortFieldEntry = {fieldName: string, keyOrder: number, sortAscending: boolean}
const interpretSortFields = (fields: string[]): sortFieldEntry[] => {
    const parities: {[key: string]: sortFieldEntry} = {}
    let lastKey = 1
    for (const f of fields) {
        if (!(f in parities)) {
            parities[f] = {fieldName: f, keyOrder: lastKey, sortAscending: true}
            lastKey += 1
        } else {
            // we don't actually care how many times something appears, just treat it as a parity bit.
            parities[f].sortAscending = !parities[f].sortAscending
        }
    }

    const result: sortFieldEntry[] = []
    for (const f in parities) {
        result.push(parities[f])
    }
    result.sort((a, b) => b.keyOrder - a.keyOrder)
    // note: opportunity to trim sort field order here if desired
    return result
}

const UnitsTable: FunctionComponent<Props> = (props) => {
    const { metricPlugins, units, metrics, selectedUnitIds, sorting, onSelectedUnitIdsChanged, documentInfo } = props
    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])
    units.sort((a, b) => a - b) // first sort by actual unit number
    // Now sort the list iteratively by each of the sorters in the sortFieldOrder state.

    const sortingRules = interpretSortFields(sortFieldOrder)
    for (const r of sortingRules) {
        const metricName = r.fieldName
        const metric = metrics[metricName]
        console.log(`Now sorting by ${metricName}`)
        if (!metric || metric['error'] || !metric.data) continue // no data, nothing to do
        units.sort((a, b) => {
            console.log(`${a} and ${b}. For a: ${metric.data[a + '']}`)
            const aval = (a + '' in metric.data) ? metric.data[a + ''] : NaN
            const bval = (b + '' in metric.data) ? metric.data[b + ''] : NaN
            console.log(`Comparing ${aval} to ${bval}`)
            // stable to cases when both values are non-numeric; otherwise always sort NaNs after numbers.
            if (isNaN(aval) && isNaN(bval)) return 0
            if (isNaN(aval)) return -1
            if (isNaN(bval)) return 1
            return r.sortAscending ? (aval - bval) : (bval - aval)
        })
        console.log(`Units now sorted to ${JSON.stringify(units)}`)
    }

    return (
        <Table className="NiceTable">
            <HeaderRow 
                plugins={metricPlugins}
                handleClick={(metricName: string) => {
                    console.log(`Got click on field with metric ${metricName}, pushing ${JSON.stringify([...sortFieldOrder, metricName])}`)
                    setSortFieldOrder([...sortFieldOrder, metricName])
                }}
                clearSorts={() => {
                    console.log('Clearing sorting')
                    setSortFieldOrder([])
                }}
            />
            <TableBody>
                {
                    units.map((unitId) => (
                        <TableRow key={unitId + '_row'}>
                            <UnitCheckbox
                                unitKey = {unitId + ''}
                                selected = {selectedUnitIds[unitId] || false}
                                handleClicked = {() => onSelectedUnitIdsChanged(toggleSelectedUnitId(selectedUnitIds, unitId))}
                            />
                            <UnitIdCell
                                id = {unitId + ''}
                                documentId = {documentInfo.documentId || 'default'}
                                sortingId = {sorting.sortingId}
                                feedUri = {documentInfo.feedUri || ''}
                            />
                            <UnitLabelCell
                                labels = {getLabelsForUnitId(unitId, sorting).join(', ')}
                            />
                            {
                                metricPlugins.map(mp => {
                                    const metricName = mp.metricName
                                    const metric = metrics[metricName] || null
                                    const d = (metric && metric.data) ? (
                                        (unitId + '' in metric.data) ? metric.data[unitId + ''] : NaN
                                    ) : NaN
                                    return (
                                        <MetricCell
                                            title={mp.tooltip}
                                            key = {metricName + '_' + unitId}
                                            data = {d}
                                            error = {metric['error'] || ''}
                                            PayloadComponent = {mp.component}
                                        />
                                    );
                                })
                            }
                        </TableRow>       
                    ))
                }
            </TableBody>
        </Table>
    );
}

export default UnitsTable
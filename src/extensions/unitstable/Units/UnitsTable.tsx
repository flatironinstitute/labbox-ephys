import { Checkbox, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { SortingUnitMetricPlugin } from '../../../extension';
import { getPathQuery } from '../../../kachery';
import { DocumentInfo } from '../../../reducers/documentInfo';
import { sortByPriority } from '../../../reducers/extensionContext';
import { Sorting } from '../../../reducers/sortings';

const getLabelsForUnitId = (unitId: number, sorting: Sorting) => {
    const unitCuration = sorting.unitCuration || {};
    return (unitCuration[unitId] || {}).labels || [];
}

const HeaderRow = React.memo((a: {columnLabels: string[]}) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_first" style={{ width: 0}} />
                <TableCell key="_unitIds"><span>Unit ID</span></TableCell>
                <TableCell key="_labels"><span>Labels</span></TableCell>
                {
                    a.columnLabels.map(columnLabel => {
                        return (
                            <TableCell key={columnLabel + '_header'}>
                                <span title={columnLabel} />
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
    sortingUnitMetrics: {[key: string]: SortingUnitMetricPlugin}
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

const UnitsTable: FunctionComponent<Props> = (props) => {
    const { units, metrics, selectedUnitIds, sorting, onSelectedUnitIdsChanged, documentInfo, sortingUnitMetrics } = props
    const sortingUnitMetricsList = sortByPriority(Object.values(sortingUnitMetrics)).filter(p => (!p.disabled))
    return (
        <Table className="NiceTable">
            <HeaderRow 
                columnLabels={sortingUnitMetricsList.map(m => (m.columnLabel))}
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
                                sortingUnitMetricsList.map(mp => {
                                    const metricName = mp.name
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
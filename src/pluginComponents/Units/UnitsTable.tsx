import { Checkbox, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { MetricPlugin } from './metricPlugins/common';
import { Sorting } from './Units';

const getLabelsForUnitId = (unitId: number, sorting: Sorting) => {
    const unitCuration = sorting.unitCuration || {};
    return (unitCuration[unitId] || {}).labels || [];
}

const HeaderRow = React.memo((a: {plugins: MetricPlugin[]}) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_first" style={{ width: 0}} />
                <TableCell key="_unitIds"><span>Unit ID</span></TableCell>
                <TableCell key="_labels"><span>Labels</span></TableCell>
                {
                    a.plugins.map(plugin => {
                        return (
                            <TableCell key={plugin.columnLabel + '_header'}>
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

const UnitIdCell = React.memo((a: {id: string}) => (
    <TableCell><span>{a.id}</span></TableCell>
));

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
    onSelectedUnitIdsChanged: () => void
}

const UnitsTable: FunctionComponent<Props> = (props) => {
    const { metricPlugins, units, metrics, selectedUnitIds, sorting, onSelectedUnitIdsChanged } = props
    return (
        <Table className="NiceTable">
            <HeaderRow 
                plugins={metricPlugins}
            />
            <TableBody>
                {
                    units.map((unitId) => (
                        <TableRow key={unitId + '_row'}>
                            <UnitCheckbox
                                unitKey = {unitId + ''}
                                selected = {selectedUnitIds[unitId] || false}
                                handleClicked = {onSelectedUnitIdsChanged}
                            />
                            <UnitIdCell id = {unitId + ''} />
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
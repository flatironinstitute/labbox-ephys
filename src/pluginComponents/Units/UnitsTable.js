import React from 'react';

import { Table, TableHead, TableBody, TableRow, TableCell, Checkbox, LinearProgress } from '@material-ui/core';

const getLabelsForUnitId = (unitId, sorting) => {
    const unitCuration = sorting.unitCuration || {};
    return (unitCuration[unitId] || {}).labels || [];
}

const HeaderRow = React.memo(({pluginLabels}) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_first" style={{ width: 0}} />
                <TableCell key="_unitIds"><span>Unit ID</span></TableCell>
                <TableCell key="_labels"><span>Labels</span></TableCell>
                {
                    pluginLabels.map(plugin => (
                        <TableCell key={plugin + '_header'}>
                            <span>{plugin}</span>
                        </TableCell>
                    ))
                }
            </TableRow>
        </TableHead>
    );
});

const UnitCheckbox = React.memo(({unitKey, selected, handleClicked}) => {
    return (
        <TableCell>
            <Checkbox
                checked={selected}
                onClick={() => handleClicked(unitKey)}
            />
        </TableCell>
    );
});

const UnitIdCell = React.memo(({id}) => (
    <TableCell><span>{id}</span></TableCell>
));

const UnitLabelCell = React.memo(({labels}) => (
    <TableCell><span>{labels}</span></TableCell>
));

const MetricCell = React.memo(({error = '', data, PayloadComponent}) => {
    if (error !== '') {
        return (<TableCell><span>{`Error: ${error}`}</span></TableCell>);
    }
    if (!data || data === '') {
        return (<TableCell><LinearProgress style={{'width': '60%'}}/></TableCell>);
    } else {
        return (
            <TableCell>
                <PayloadComponent record = {data} />
            </TableCell>
        );
    }
});

const UnitsTable = ({metricPlugins = [], units = [], metrics, selectedUnitIds = {}, sorting,
                    onSelectedUnitIdsChanged = () => ''}) => {
    return (
        <Table className="NiceTable">
            <HeaderRow 
                pluginLabels={metricPlugins.map(mp => mp['columnLabel'])}
            />
            <TableBody>
                {
                    units.map((unitId) => (
                        <TableRow key={unitId + '_row'}>
                            <UnitCheckbox
                                unitKey = {unitId}
                                selected = {selectedUnitIds[unitId] || false}
                                handleClicked = {onSelectedUnitIdsChanged}
                            />
                            <UnitIdCell id = {unitId} />
                            <UnitLabelCell
                                labels = {getLabelsForUnitId(unitId, sorting).join(', ')}
                            />
                            {
                                metricPlugins.map(mp => {
                                    const metricName = mp['metricName'];
                                    const metric = metrics[metricName] || {'data': NaN, error: ''};
                                    return (
                                        <MetricCell
                                            key = {metricName + '_' + unitId}
                                            data = {((metric['data']) === '' || 
                                                    !metric['data'][unitId])
                                                ? NaN : metric['data'][unitId]}
                                            error = {metric['error']}
                                            PayloadComponent = {mp}
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

export default UnitsTable;



import React from 'react';

const UnitSnrs = React.memo(({record = {}}) => {
    return (
        <span>{record.toFixed(4)}</span>
    );
});

UnitSnrs.metricName = 'UnitSnrs';
UnitSnrs.columnLabel = 'SNR';
UnitSnrs.tooltip = 'Unit SNR (peak-to-peak amp of mean waveform / est. std. dev on peak chan)';
UnitSnrs.hitherFnName = 'createjob_get_unit_snrs';
UnitSnrs.metricFnParams = {
};
UnitSnrs.hitherConfig = {
    wait: true,
    newHitherJobMethod: true,
    useClientCache: true
}

UnitSnrs.metricPlugin = {
    development: false
}

export default UnitSnrs;
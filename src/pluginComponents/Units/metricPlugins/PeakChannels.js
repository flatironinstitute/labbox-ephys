import React from 'react';

const PeakChannels = React.memo(({record = {}}) => {
    return (
        <span>{record}</span>
    );
});

PeakChannels.metricName = 'PeakChannels';
PeakChannels.columnLabel = 'Peak chan.';
PeakChannels.tooltip = 'ID of channel where the peak-to-peak amplitude is maximal';
PeakChannels.hitherFnName = 'createjob_get_peak_channels';
PeakChannels.metricFnParams = {
};
PeakChannels.hitherConfig = {
    wait: true,
    newHitherJobMethod: true,
    useClientCache: true
}

PeakChannels.metricPlugin = {
    development: false
}

export default PeakChannels;
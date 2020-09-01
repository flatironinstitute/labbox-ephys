import React from 'react';

const EventCount = React.memo(({record}) => {
    return (
        <span>{record.count}</span>
    );
});

EventCount.metricName = 'EventCount';
EventCount.columnLabel = 'Num. events';
EventCount.tooltip = 'Number of firing events';
EventCount.hitherFnName = 'createjob_get_firing_data';
EventCount.metricFnParams = {};
EventCount.hitherConfig = {
    wait: true,
    useClientCache: true,
    newHitherJobMethod: true
}


EventCount.metricPlugin = {
    development: false
}

export default EventCount;
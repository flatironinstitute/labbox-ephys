import React from 'react';

const EventCount = React.memo(({record}) => {
    return (
        <span>{record.count}</span>
    );
});

EventCount.metricName = 'EventCount';
EventCount.columnLabel = 'Num. events';
EventCount.tooltip = 'Number of firing events';
EventCount.hitherFnName = 'get_firing_data';
EventCount.metricFnParams = {};
EventCount.hitherConfig = {
    auto_substitute_file_objects: true,
    wait: true,
    useClientCache: true,
    hither_config: {
        use_job_cache: true
    },
    job_handler_name: 'partition3'
}


EventCount.metricPlugin = {
    development: false
}

export default EventCount;
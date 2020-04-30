import React, { useState } from 'react'
import ElectrodeGeometryWidget from './ElectrodeGeometryWidget'
import { Table, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';

const RecordingInfoView = ({ recordingInfo  }) => {
    const ri = recordingInfo;
    const [selectedElectrodeIds, setSelectedElectrodeIds] = useState({});
    return (
        <div>
            <div style={{ width: 600 }}>
                <RecordingViewTable
                    sampling_frequency={ri.sampling_frequency}
                    num_frames={ri.num_frames}
                    channel_ids={ri.channel_ids}
                    channel_groups={ri.channel_groups}
                />
            </div>
            <ElectrodeGeometryWidget
                locations={ri.geom}
                selectedElectrodeIds={selectedElectrodeIds}
                onSelectedElectrodeIdsChanged={(x) => setSelectedElectrodeIds(x)}
            />
        </div>
    );
}

const RecordingViewTable = ({ sampling_frequency, channel_ids, channel_groups, num_frames }) => {
    return (
        <Table>
            <TableHead>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Sampling frequency</TableCell>
                    <TableCell>{sampling_frequency}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Num. frames</TableCell>
                    <TableCell>{num_frames}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Duration (min)</TableCell>
                    <TableCell>{num_frames / sampling_frequency / 60}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Channel IDs</TableCell>
                    <TableCell>{commasep(channel_ids)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Channel groups</TableCell>
                    <TableCell>{commasep(channel_groups)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

function commasep(x) {
    if (!x) return JSON.stringify(x);
    return x.join(', ');
}

export default RecordingInfoView;
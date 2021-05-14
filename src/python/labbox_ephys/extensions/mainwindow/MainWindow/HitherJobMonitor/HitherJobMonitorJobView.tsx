import React from 'react'
import NiceTable from "../../../common/NiceTable";

import { HitherJob } from 'labbox';
import { FunctionComponent, useState } from "react";
import Hyperlink from "../../../common/Hyperlink";
import { Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import { Delete } from "@material-ui/icons";

const HitherJobMonitorJobView: FunctionComponent<{
    job: HitherJob,
    onBack: () => void,
}> = ({
    job,
    onBack
}) => {
    return (
        <div>
            <p><Hyperlink onClick={onBack}>Back to jobs</Hyperlink></p>
            <HitherJobInfoView job={job}/>
        </div>
    )
}

const HitherJobInfoView: FunctionComponent<{job: HitherJob}> = ({ job }) => {
    const argumentsCollapsable = (job.kwargs && niceStringify(job.kwargs).length > 50);
    const logArgumentsToConsole = (job.kwargs && niceStringify(job.kwargs).length > 1000);
    const [argumentsExpanded, setArgumentsExpanded] = useState<boolean>(!argumentsCollapsable);

    const resultCollapsable = (job.result && niceStringify(job.result).length > 50);
    const logResultToConsole = (job.result && niceStringify(job.result).length > 1000);
    const [resultExpanded, setResultExpanded] = useState(!resultCollapsable);

    const argumentsElement = argumentsExpanded ? (
        <div>
            {
                argumentsCollapsable && <Button onClick={() => setArgumentsExpanded(false)}>Collapse</Button>
            }
            <pre>{job.kwargs ? niceStringify(job.kwargs): ''}</pre>
        </div>
    ) : (
        logArgumentsToConsole ? (
            <Button onClick={() => {console.info(job.kwargs)}} title="Write input argumetns to the browser developer tools console">Write input arguments to console</Button>
        ) : (
            <Button onClick={() => {console.info(job.kwargs); setArgumentsExpanded(true)}}>Expand</Button>
        )
    )

    const resultElement = resultExpanded ? (
        <div>
            {
                resultCollapsable && <Button onClick={() => setResultExpanded(false)}>Collapse</Button>
            }
            <pre>{job.result ? niceStringify(job.result): ''}</pre>
        </div>
    ) : (
        logResultToConsole ? (
            <Button onClick={() => {console.info(job.result)}} title="Write result to the browser developer tools console">Write result to console</Button>
        ) : (
            <Button onClick={() => {console.info(job.result); setResultExpanded(true)}}>Expand</Button>
        )
    )

    const fields = [
        {
            label: 'Job ID',
            value: job.jobId
        },
        {
            label: 'Function name',
            value: job.functionName
        },
        {
            label: 'Input arguments',
            value: argumentsElement
        },
        {
            label: 'Status',
            value: job.status
        },
        {
            label: 'Started',
            value: job.timestampStarted ? formatTime(new Date(job.timestampStarted)) : ''
        },
        {
            label: 'Finished',
            value: job.timestampFinished ? formatTime(new Date(job.timestampFinished)) : ''
        },
        {
            label: 'Result',
            value: resultElement
        },
        {
            label: 'Error message',
            value: job.error_message
        }
    ]
    return (
        <div>
            <Table className="NiceTable">
                <TableHead></TableHead>
                <TableBody>
                    {
                        fields.map(f => (
                            <TableRow key={f.label}>
                                <TableCell>{f.label}</TableCell>
                                <TableCell>{f.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            {/* <ConsoleOutView consoleOut={(job.runtime_info || {}).console_out} includeTimestamps={true} /> */}
        </div>
    )
}

function niceStringify(x: any) {
    // TODO: figure out how to keep numeric arrays on one line in this expansion
    return JSON.stringify(x, null, 4);
}

function formatTime(d: Date) {
    const datesAreOnSameDay = (first: Date, second: Date) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
    let ret = '';
    if (!datesAreOnSameDay(d, new Date())) {
        ret += `${(d.getMonth() + 1)}/${d.getDate()}/${d.getFullYear()}} `;
    }
    ret += `${d.toLocaleTimeString()}`
    return ret;
}

export default HitherJobMonitorJobView
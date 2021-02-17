import { Button, IconButton, Link as LinkMui, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { HitherContext, HitherJob } from 'labbox';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import NiceTable from '../../extensions/common/NiceTable';

type Props = {}

const HitherJobMonitor: FunctionComponent<Props> = () => {
    const [hitherJobs, setHitherJobs] = useState<HitherJob[]>([])
    const hither = useContext(HitherContext)
    useEffect(() => {
        // this should only get called once
        // (hither should not change, but if it does we might have a problem here)
        const update = () => {
            const hj = hither.getHitherJobs()
            setHitherJobs(hj)
        }
        update()
        const timer1 = setInterval(() => {
            update()
        }, 1000)
        return () => {
            clearInterval(timer1)
        }
    }, [hither])

    const { allJobs } = {
        allJobs: hitherJobs
        // pendingJobs: hitherJobs.filter(j => (j.status === 'pending')),
        // runningJobs: hitherJobs.filter(j => (j.status === 'running')),
        // finishedJobs: hitherJobs.filter(j => (j.status === 'finished')),
        // erroredJobs: hitherJobs.filter(j => (j.status === 'error')),
    }

    const [currentJob, setCurrentJob] = useState<HitherJob | null>(null);

    const handleCancelJob = (j: HitherJob) => {
        console.warn('Cancel job not implemented')
    }

    return (
        <div style={{padding: 20}}>
            {
                currentJob ? (
                    <div>
                        <div><Button onClick={() => setCurrentJob(null)}>Back to table</Button></div>
                        <HitherJobInfoView job={currentJob} />
                    </div>
                ) : (
                    <HitherJobMonitorTable
                        jobs={allJobs}
                        onViewJob={j => setCurrentJob(j)}
                        onCancelJob={j => handleCancelJob(j)}
                    />
                )
            }
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
            <Button onClick={() => {console.info(job.kwargs)}}>Write arguments to console</Button>
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
            <Button onClick={() => {console.info(job.result)}}>Write result to console</Button>
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
            label: 'Message',
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
            <ConsoleOutView consoleOut={(job.runtime_info || {}).console_out} includeTimestamps={true} />
        </div>
    )
}

const HitherJobMonitorTable: FunctionComponent<{
    jobs: HitherJob[],
    onViewJob: (job: HitherJob) => void,
    onCancelJob: (job: HitherJob) => void
}> = ({
    jobs,
    onViewJob,
    onCancelJob
}) => {
    const columns = [
        {
            key: 'jobId',
            label: 'Job'
        },
        {
            key: 'functionName',
            label: 'Function'
        },
        {
            key: 'status',
            label: 'Status'
        },
        {
            key: 'started',
            label: 'Started'
        },
        {
            key: 'finished',
            label: 'Finished'
        },
        {
            key: 'message',
            label: 'Message'
        }
    ];
    const sortedJobs = jobs;
    sortedJobs.sort((j1: HitherJob, j2: HitherJob) => {
        if ((j1.status === 'running') && (j2.status !== 'running'))
            return -1;
        else if ((j2.status === 'running') && (j1.status !== 'running'))
            return 1;
        if ((j1.timestampStarted) && (j2.timestampStarted)) {
            if (j1.timestampStarted < j2.timestampStarted) return 1;
            else if (j2.timestampStarted < j1.timestampStarted) return -1;
            else return 0;
        }
        else return 0
    })
    const rows = sortedJobs.map((j) => ({
        key: j.jobId || 'null',
        columnValues: {
            jobId: {
                text: j.jobId,
                element: <LinkMui href="#" onClick={() => {onViewJob && onViewJob(j)}}>{j.jobId}</LinkMui>
            },
            functionName: {
                text: j.functionName
            },
            status: {
                text: j.status,
                element: j.status === 'running' ? (
                    <span><span>{j.status} </span><CancelJobButton onClick={() => {onCancelJob && onCancelJob(j)}}/></span>
                ) : <span>{j.status}</span>
            },
            started: {text: j.timestampStarted ? formatTime(new Date(j.timestampStarted)) : ''},
            finished: {text: j.timestampFinished ? formatTime(new Date(j.timestampFinished)) : ''},
            message: {text: j.error_message || ''}
        }
    }));
    return (
        <NiceTable
            rows={rows}
            columns={columns}
        />
    )
}

const CancelJobButton: FunctionComponent<{onClick: () => void}> = ({ onClick }) => {
    return (
        <IconButton title={"Cancel job"} onClick={onClick}><Delete /></IconButton>
    )
}

const ConsoleOutView: FunctionComponent<{consoleOut: {lines: {timestamp: string, text: string}[]}, includeTimestamps: boolean}> = ({ consoleOut, includeTimestamps=true }) => {
    if (!consoleOut) return <div></div>;
    if (!consoleOut.lines) return <div></div>;
    let txt;
    if (includeTimestamps) {
        txt = consoleOut.lines.map(line => `${line.timestamp}: ${line.text}`).join('\n');
    }
    else {
        txt = consoleOut.lines.map(line => `${line.text}`).join('\n');
    }
    return (
        <div style={{backgroundColor: 'black', color: 'white'}}>
            <pre>
                {txt}
            </pre>
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

export default HitherJobMonitor
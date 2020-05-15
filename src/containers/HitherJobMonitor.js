import React, { useState } from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable';
import { Link as LinkMui, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

const HitherJobMonitor = ({
    allJobs, pendingJobs, runningJobs, finishedJobs, erroredJobs
}) => {
    const [currentJob, setCurrentJob] = useState(null);

    if (currentJob) {
        return (
            <div>
                <div><Button onClick={() => setCurrentJob(null)}>Back to table</Button></div>
                <HitherJobInfoView job={currentJob} />
            </div>
        )
    }
    else {
        return (
            <HitherJobMonitorTable
                jobs={allJobs}
                onViewJob={j => setCurrentJob(j)}
            />
        )
    }
}

const HitherJobInfoView = ({ job }) => {
    const argumentsCollapsable = (job.kwargs && niceStringify(job.kwargs).length > 50);
    const logArgumentsToConsole = (job.kwargs && niceStringify(job.kwargs).length > 1000);
    const [argumentsExpanded, setArgumentsExpanded] = useState(!argumentsCollapsable);

    const resultCollapsable = (job.result && niceStringify(job.result).length > 50);
    const logResultToConsole = (job.result && niceStringify(job.result).length > 1000);
    const [resultExpanded, setResultExpanded] = useState(!resultCollapsable);

    const argumentsElement = argumentsExpanded ? (
        <div>
            {
                argumentsCollapsable && <Button onClick={() => setArgumentsExpanded(false)}>Collapse</Button>
            }
            <pre>{job.kwargs ? niceStringify(job.kwargs, null, 4): ''}</pre>
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
            <pre>{job.result ? niceStringify(job.result, null, 4): ''}</pre>
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
            label: 'Result',
            value: resultElement
        }
    ]
    return (
        <div>
            <Table>
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
        </div>
    )
}

const HitherJobMonitorTable = ({
    jobs,
    onViewJob
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
        }
    ];
    const rows = jobs.map((j) => ({
        key: j.jobId,
        jobId: {
            element: <LinkMui href="#" onClick={() => {onViewJob && onViewJob(j)}}>{j.jobId}</LinkMui>
        },
        functionName: j.functionName,
        status: j.status
    }));
    return (
        <NiceTable
            rows={rows}
            columns={columns}
        />
    )
}

function niceStringify(x) {
    // TODO: figure out how to keep numeric arrays on one line in this expansion
    return JSON.stringify(x, null, 4);
}

const mapStateToProps = state => ({
    allJobs: state.hitherJobs,
    pendingJobs: state.hitherJobs.filter(j => (j.status === 'pending')),
    runningJobs: state.hitherJobs.filter(j => (j.status === 'running')),
    finishedJobs: state.hitherJobs.filter(j => (j.status === 'finished')),
    erroredJobs: state.hitherJobs.filter(j => (j.status === 'error')),
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HitherJobMonitor);
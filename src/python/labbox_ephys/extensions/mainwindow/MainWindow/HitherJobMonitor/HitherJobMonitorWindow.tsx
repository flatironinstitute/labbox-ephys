import { Table, TableCell, TableRow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { HitherJob, LabboxProviderContext } from 'labbox';
import React, { FunctionComponent, useCallback, useContext, useState } from 'react';
import { parseWorkspaceUri } from '../../../pluginInterface/misc';
import { WorkspaceState } from '../../../pluginInterface/workspaceReducer';
import { useMonitorHitherJobs } from './HitherJobMonitorControl';
import HitherJobMonitorJobView from './HitherJobMonitorJobView';
import HitherJobMonitorTable from './HitherJobMonitorTable';

const useStyles = makeStyles((theme) => ({
    paper: {
        left: 100,
        top: 100,
        right: 100,
        bottom: 100,
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        overflow: 'auto'
    },
}));

type Props = {
}

const HitherJobMonitorWindow: FunctionComponent<Props> = () => {
    const classes = useStyles()

    const { allJobs } = useMonitorHitherJobs()
    const [currentJob, setCurrentJob] = useState<HitherJob | null>(null)

    const handleViewJob = useCallback((job: HitherJob) => {
        setCurrentJob(job)
    }, [])
    const handleCancelJob = useCallback(() => {
    }, [])
    const handleBack = useCallback(() => {
        setCurrentJob(null)
    }, [])

    return (
        <div className={classes.paper} style={{zIndex: 9999}}>
            <h2>Job Monitor</h2>
            {
                currentJob ? (
                    <HitherJobMonitorJobView
                        job={currentJob}
                        onBack={handleBack}
                    />
                ) : (
                    <HitherJobMonitorTable
                        jobs={allJobs}
                        onViewJob={handleViewJob}
                        onCancelJob={handleCancelJob}
                    />
                )
            }
            
        </div>
    )
}

export default HitherJobMonitorWindow
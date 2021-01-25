import { CircularProgress } from '@material-ui/core';
import React, { Dispatch, FunctionComponent, useCallback, useMemo } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { deleteSortings } from '../actions';
import { WorkspaceInfo } from '../AppContainer';
import NiceTable from '../components/NiceTable';
import { useSortingInfos } from '../extensions/common/getRecordingInfo';
import { RootAction, RootState } from '../reducers';
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
import { Sorting } from '../reducers/sortings';
import { WorkspaceRouteDispatch } from './WorkspaceView';
=======
import { Sorting, SortingInfo } from '../reducers/sortings';
import { WorkspaceInfo } from '../reducers/workspaceInfo';
>>>>>>> import recordings view python scripts



interface StateProps {
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    workspaceInfo: WorkspaceInfo
>>>>>>> import recordings view python scripts
}

interface DispatchProps {
    onDeleteSortings: (sortingIds: string[]) => void
}

interface OwnProps {
    sortings: Sorting[]
    workspaceRouteDispatch: WorkspaceRouteDispatch
    workspaceInfo: WorkspaceInfo
}

type Props = StateProps & DispatchProps & OwnProps

<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
const SortingsTable: FunctionComponent<Props> = ({ sortings, onDeleteSortings, workspaceInfo, workspaceRouteDispatch }) => {
    const { readOnly } = workspaceInfo;

    const handleViewSorting = useCallback((sorting: Sorting) => {
        workspaceRouteDispatch({
            type: 'gotoSortingPage',
            recordingId: sorting.recordingId,
            sortingId: sorting.sortingId
        })
    }, [workspaceRouteDispatch])

    const sortingInfos = useSortingInfos(sortings)

    const sortings2: Sorting[] = useMemo(() => (sortByKey<Sorting>(sortings, 'sortingLabel')), [sortings])
    const rows = useMemo(() => (sortings2.map(s => {
        const sortingInfo = sortingInfos[s.sortingId]
        return {
            key: s.sortingId,
            columnValues: {
                sorting: s,
                sortingLabel: {
                    text: s.sortingLabel,
                    element: <ViewSortingLink sorting={s} onClick={handleViewSorting} />
                    // element: <Link title={"View this sorting"} to={`/${workspaceName}/sorting/${s.sortingId}${getPathQuery({feedUri})}`}>{s.sortingLabel}</Link>,
                },
                numUnits: sortingInfo ? sortingInfo.unit_ids.length : {element: <CircularProgress />}
            }
        }
    })), [sortings2, handleViewSorting, sortingInfos])
=======
const calculationPool = createCalculationPool({maxSimultaneous: 6})

const SortingsTable: FunctionComponent<Props> = ({ sortings, onDeleteSortings, onSetSortingInfo, workspaceInfo }) => {
    const hither = useContext(HitherContext)
    const { workspaceName, feedUri, readOnly } = workspaceInfo;
    const infosInProgress = useRef(new Set<string>())

    useEffect(() => {
        for (const sor of sortings) {
            if ((!sor.sortingInfo) && (!infosInProgress.current.has(sor.sortingId))) {
                infosInProgress.current.add(sor.sortingId)
                hither.createHitherJob(
                    'createjob_get_sorting_info',
                    { sorting_object: sor.sortingObject, recording_object: sor.recordingObject },
                    {
                        useClientCache: true,
                        calculationPool: calculationPool
                    }
                ).wait().then(sortingInfo => {
                    onSetSortingInfo({ sortingId: sor.sortingId, sortingInfo: sortingInfo });
                }).catch((err: Error) => {
                    console.error(err);
                    return;
                })
            }
        }
    }, [sortings, hither, onSetSortingInfo])

    const sortings2: Sorting[] = useMemo(() => (sortByKey<Sorting>(sortings, 'sortingLabel')), [sortings])
    const rows = useMemo(() => (sortings2.map(s => ({
        key: s.sortingId,
        columnValues: {
            sorting: s,
            sortingLabel: {
                text: s.sortingLabel,
                element: <Link title={"View this sorting"} to={`/${workspaceName}/sorting/${s.sortingId}${getPathQuery({feedUri})}`}>{s.sortingLabel}</Link>,
            },
            numUnits: s.sortingInfo ? s.sortingInfo.unit_ids.length : {element: <CircularProgress />}
        }
    }))), [sortings2, workspaceName, feedUri])
>>>>>>> import recordings view python scripts

    const columns = [
        {
            key: 'sortingLabel',
            label: 'Sorting'
        },
        {
            key: 'numUnits',
            label: 'Num. units'
        }
    ]

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this sorting"}
                onDeleteRow={readOnly ? undefined : (key, columnValues) => onDeleteSortings([key])}
            />
        </div>
    );
}

const ViewSortingLink: FunctionComponent<{sorting: Sorting, onClick: (s: Sorting) => void}> = ({sorting, onClick}) => {
    const handleClick = useCallback(() => {
        onClick(sorting)
    }, [sorting, onClick])
    return (
        <Anchor title="View recording" onClick={handleClick}>{sorting.sortingLabel}</Anchor>
    )
}

const Anchor: FunctionComponent<{title: string, onClick: () => void}> = ({title, children, onClick}) => {
    return (
        <button type="button" className="link-button" onClick={onClick}>{children}</button>
    )
}

const sortByKey = <T extends {[key: string]: any}>(array: T[], key: string): T[] => {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({ // todo
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    workspaceInfo: state.workspaceInfo
>>>>>>> import recordings view python scripts
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onDeleteSortings: (sortingIds: string[]) => dispatch(deleteSortings(sortingIds))
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(SortingsTable)
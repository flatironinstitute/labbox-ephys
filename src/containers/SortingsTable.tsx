import { CircularProgress } from '@material-ui/core';
import React, { Dispatch, FunctionComponent, useContext, useEffect, useMemo, useRef } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteSortings, setSortingInfo } from '../actions';
import NiceTable from '../components/NiceTable';
import { createCalculationPool, HitherContext } from '../extensions/common/hither';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { Sorting, SortingInfo } from '../reducers/sortings';



interface StateProps {
    documentInfo: DocumentInfo
}

interface DispatchProps {
    onDeleteSortings: (sortingIds: string[]) => void
    onSetSortingInfo: (a: { sortingId: string, sortingInfo: SortingInfo }) => void
}

interface OwnProps {
    sortings: Sorting[]
}

type Props = StateProps & DispatchProps & OwnProps

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const SortingsTable: FunctionComponent<Props> = ({ sortings, onDeleteSortings, onSetSortingInfo, documentInfo }) => {
    const hither = useContext(HitherContext)
    const { documentId, feedUri, readOnly } = documentInfo;
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
                element: <Link title={"View this sorting"} to={`/${documentId}/sorting/${s.sortingId}${getPathQuery({feedUri})}`}>{s.sortingLabel}</Link>,
            },
            numUnits: s.sortingInfo ? s.sortingInfo.unit_ids.length : {element: <CircularProgress />}
        }
    }))), [sortings2, documentId, feedUri])

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

const sortByKey = <T extends {[key: string]: any}>(array: T[], key: string): T[] => {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({ // todo
    documentInfo: state.documentInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onDeleteSortings: sortingIds => dispatch(deleteSortings(sortingIds)),
    onSetSortingInfo: ({ sortingId, sortingInfo }) => dispatch(setSortingInfo({ sortingId, sortingInfo }))
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(SortingsTable)
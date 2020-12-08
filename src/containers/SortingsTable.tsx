import { CircularProgress } from '@material-ui/core';
import React, { Dispatch, FunctionComponent, useEffect } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteSortings, setSortingInfo } from '../actions';
import NiceTable from '../components/NiceTable';
import { HitherContext } from '../extensions/extensionInterface';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { Sorting, SortingInfo } from '../reducers/sortings';



interface StateProps {
    documentInfo: DocumentInfo
    hither: HitherContext
}

interface DispatchProps {
    onDeleteSortings: (sortingIds: string[]) => void
    onSetSortingInfo: (a: { sortingId: string, sortingInfo: SortingInfo }) => void
}

interface OwnProps {
    sortings: Sorting[]
}

type Props = StateProps & DispatchProps & OwnProps

const SortingsTable: FunctionComponent<Props> = ({ sortings, onDeleteSortings, onSetSortingInfo, documentInfo, hither }) => {
    const { documentId, feedUri, readOnly } = documentInfo;

    function sortByKey<T extends {[key: string]: any}>(array: T[], key: string): T[] {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    const sortings2: Sorting[] = sortByKey<Sorting>(sortings, 'sortingLabel')

    useEffect(() => {
        const thisSortings = sortings
        ;(async () => {
            for (const sor of sortings) {
                if (thisSortings !== sortings) return
                if (!sor.sortingInfo) {
                    let info;
                    try {
                        // for a nice gui effect
                        const sortingInfoJob = hither.createHitherJob(
                            'createjob_get_sorting_info',
                            { sorting_object: sor.sortingObject, recording_object: sor.recordingObject },
                            {
                                useClientCache: true,
                                newHitherJobMethod: true
                            }
                        )
                        info = await sortingInfoJob.wait() as SortingInfo;
                        onSetSortingInfo({ sortingId: sor.sortingId, sortingInfo: info });
                    }
                    catch (err) {
                        console.error(err);
                        return;
                    }
                }
            }
        })()
    }, [sortings, onSetSortingInfo, hither])

    const rows = sortings2.map(s => ({
        sorting: s,
        key: s.sortingId,
        sortingLabel: {
            text: s.sortingLabel,
            element: <Link title={"View this sorting"} to={`/${documentId}/sorting/${s.sortingId}${getPathQuery({feedUri})}`}>{s.sortingLabel}</Link>,
        },
        numUnits: s.sortingInfo ? s.sortingInfo.unit_ids.length : {element: <CircularProgress />}
    }));

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
                onDeleteRow={readOnly ? null : (row: any) => onDeleteSortings([row.sorting.sortingId])}
            />
        </div>
    );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({ // todo
    documentInfo: state.documentInfo,
    hither: state.hitherContext
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onDeleteSortings: sortingIds => dispatch(deleteSortings(sortingIds)),
    onSetSortingInfo: ({ sortingId, sortingInfo }) => dispatch(setSortingInfo({ sortingId, sortingInfo }))
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(SortingsTable)
import React, { FunctionComponent } from 'react';
import { SortingViewProps } from '../../../extensionInterface';
import sortByPriority from '../../../sortByPriority';
import Expandable from './Expandable';

const AllUnitsTab: FunctionComponent<SortingViewProps> = (props) => {
    // very important that we exclude the CurationSortingView, else we get infinite recursion
    // also exclude the units table
    const toExclude = new Set(['CurationSortingView', 'UnitsTable'])
    const sortingViews = sortByPriority(props.plugins.sortingViews).filter(v => (!v.disabled))
        .filter(v => (!toExclude.has(v.name))) 
    return (
        <div>
            {
                sortingViews.map(sv => {
                    return (
                        <Expandable
                            key={sv.name}
                            label={sv.label}
                            defaultExpanded={sv.defaultExpanded ? true : false}
                        >
                            <sv.component
                                {...sv.props || {}}
                                sorting={props.sorting}
                                recording={props.recording}
                                selection={props.selection}
                                selectionDispatch={props.selectionDispatch}
                                curationDispatch={props.curationDispatch}
                                readOnly={props.readOnly}
                                plugins={props.plugins}
                                calculationPool={props.calculationPool}
                            />
                        </Expandable>
                    )
                })
            }
        </div>
    )
}

export default AllUnitsTab
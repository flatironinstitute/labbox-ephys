import React, { Fragment, FunctionComponent } from 'react';
import createCalculationPool from '../../common/createCalculationPool';
import { SortingViewProps } from '../../extensionInterface';
import sortByPriority from '../../sortByPriority';
import Expandable from './Expandable';

const calculationPool = createCalculationPool({ maxSimultaneous: 6, method: 'queue'})

const SelectedUnitsView: FunctionComponent<SortingViewProps> = (props) => {
    const toExclude = new Set<string>([])
    const sortingUnitViews = sortByPriority(props.plugins.sortingUnitViews).filter(v => (!v.disabled))
        .filter(v => (!toExclude.has(v.name)))
    
    if ((props.selection.selectedUnitIds || []).length === 0) {
        return <div>Please select one or more units</div>
    }
    return (
        <div>
            {
                sortingUnitViews.map(sv => {
                    return (
                        <Expandable
                            key={sv.name}
                            label={sv.label}
                            defaultExpanded={sv.defaultExpanded ? true : false}
                        >
                            {
                                (props.selection.selectedUnitIds || []).sort().map(unitId => {
                                    return (
                                        <Fragment key={unitId}>
                                            <h3>Unit {unitId}</h3>
                                            <sv.component
                                                {...sv.props || {}}
                                                {...props}
                                                unitId={unitId}
                                                calculationPool={calculationPool}
                                                selectedSpikeIndex={null}
                                                onSelectedSpikeIndexChanged={(index: number | null)  => {}}
                                            />
                                        </Fragment>
                                    )
                                })
                            }
                        </Expandable>
                    )
                })
            }
        </div>
    )
}

export default SelectedUnitsView
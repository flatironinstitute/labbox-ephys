import { Grid } from "@material-ui/core"
import React, { Fragment, FunctionComponent } from 'react'
import Expandable from "../../curation/CurationSortingView/Expandable"
import { SortingUnitViewProps } from "../../extensionInterface"
import sortByPriority from "../../sortByPriority"


const MVSortingUnitView: FunctionComponent<SortingUnitViewProps> = (props) => {
    const plugins = {...props.plugins, sortingUnitViews: {...props.plugins.sortingUnitViews}}
    // important to exclude this plugin (not only for this widget but for all children) to avoid infinite recursion
    delete plugins.sortingUnitViews['MVSortingUnitView'] 
    const sortingUnitViewPlugins = sortByPriority(plugins.sortingUnitViews)

    return (
        <Fragment>
            {/* Non-full width first */}
            <Grid container style={{flexFlow: 'wrap'}} spacing={0}>
                {
                    sortingUnitViewPlugins.filter(p => (!p.fullWidth)).map(suv => (
                        <Grid item key={suv.name}>
                            {/* Important to send in the plugins that do not include this one */}
                            <suv.component {...{...props, plugins}} width={400} height={400} />
                        </Grid>
                    ))
                }
            </Grid>
            {/* Full width */}
            <Grid container style={{flexFlow: 'column'}} spacing={0}>
                {
                    sortingUnitViewPlugins.filter(p => (p.fullWidth)).map(suv => (
                        <Grid item key={suv.name}>
                            {/* Important to send in the plugins that do not include this one */}
                            <Expandable defaultExpanded={suv.defaultExpanded} label={suv.label}>
                                <suv.component {...{...props, plugins}} width={props.width} height={400} />
                            </Expandable>
                        </Grid>
                    ))
                }
            </Grid>
        </Fragment>
    )
}

export default MVSortingUnitView
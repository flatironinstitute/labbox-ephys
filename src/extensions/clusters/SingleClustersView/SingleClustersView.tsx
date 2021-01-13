import React, { FunctionComponent } from 'react'
import { SortingViewProps } from "../../extensionInterface"

const SingleClustersView: FunctionComponent<SortingViewProps> = ({recording, sorting}) => {
    
    return (
        <div>
            Example sorting view. Sorting ID: {sorting.sortingId}
        </div>
    )
}

export default SingleClustersView
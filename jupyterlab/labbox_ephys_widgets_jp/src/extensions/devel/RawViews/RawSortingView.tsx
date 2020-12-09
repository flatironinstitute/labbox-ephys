import React, { FunctionComponent } from 'react'
import { Sorting } from '../../extensionInterface'

interface Props {
    sorting: Sorting
}

const RawSortingView: FunctionComponent<Props> = ({ sorting }) => {
    return (
        <div>
            <pre>
                {JSON.stringify(sorting, null, 4)}
            </pre>
        </div>
    )
}

export default RawSortingView
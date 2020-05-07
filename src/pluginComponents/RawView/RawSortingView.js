import React from 'react'

const RawSortingView = ({ sorting }) => {
    return (
        <div>
            <pre>
                {JSON.stringify(sorting, null, 4)}
            </pre>
        </div>
    )
}

RawSortingView.sortingViewPlugin = {
    label: 'Raw sorting data'
}

export default RawSortingView
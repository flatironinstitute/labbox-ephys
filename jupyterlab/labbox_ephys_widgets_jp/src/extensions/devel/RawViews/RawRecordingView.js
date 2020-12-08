import React from 'react'

const RawRecordingView = ({ recording }) => {
    return (
        <div>
            <pre>
                {JSON.stringify(recording, null, 4)}
            </pre>
        </div>
    )
}

export default RawRecordingView
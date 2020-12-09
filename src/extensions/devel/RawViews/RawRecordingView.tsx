import React, { FunctionComponent } from 'react'
import { Recording } from '../../extensionInterface'

interface Props {
    recording: Recording
}

const RawRecordingView: FunctionComponent<Props> = ({ recording }) => {
    return (
        <div>
            <pre>
                {JSON.stringify(recording, null, 4)}
            </pre>
        </div>
    )
}

export default RawRecordingView
import React, { useState } from 'react';

const step = 0.001

const SpanWidget = ({ onTimeRangeChanged, info: { timeRange = [0, 0], numTimepoints } }) => {
    const [value, setValue] = useState(0)
    const [steper, setStepper] = useState(0)

    const rangeDiff = timeRange[1] - timeRange[0]

    React.useEffect(() => {
        timeRange[0] !== 0 && setValue(timeRange[0])
    }, [timeRange])

    React.useEffect(() => {
        setStepper(timeRange[1] - timeRange[0])
    }, [timeRange, rangeDiff])


    return <div style={{ width: "100%" }}>
        <input
            style={{ width: "100%", padding: '10px 0' }}
            type="range"
            step={step}
            min="0"
            max={numTimepoints}
            onMouseDown={e => {
                return
            }}
            onMouseUp={() => {
                onTimeRangeChanged([value, value + steper]);
            }}
            onChange={e => {
                setValue(+e.target.value)
            }}
            value={value}
        />
    </div>
}

export default SpanWidget
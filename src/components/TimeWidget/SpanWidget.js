import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider';

const CustomSlider = withStyles({
    root: {
        color: '#3a8589',
        height: 3,
        padding: '13px 0',
        width: '99%'
    },
    thumb: {
        height: 27,
        width: 27,
        backgroundColor: '#fff',
        border: '1px solid currentColor',
        marginTop: -12,
        marginLeft: -13,
        boxShadow: '#ebebeb 0 2px 2px',
        '&:focus, &:hover, &$active': {
            boxShadow: '#ccc 0 2px 3px 1px',
        },
        '& .bar': {
            height: 9,
            width: 1,
            backgroundColor: 'currentColor',
            marginLeft: 1,
            marginRight: 1,
        },
    },
    active: {},
    track: {
        height: 3,
    },
    rail: {
        color: '#d8d8d8',
        opacity: 1,
        height: 3,
    },
})(Slider);

const AirbnbThumbComponent = React.memo((props) => {
    return (
        <span {...props}>
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
        </span>
    );
})


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

    return <Grid container alignItems="center">
        <CustomSlider
            ThumbComponent={AirbnbThumbComponent}
            step={step}
            min={0}
            max={numTimepoints}
            onChangeCommitted={() => {
                onTimeRangeChanged([value, value + steper]);
            }}
            onChange={(_e, value) => {
                setValue(value)
            }}
            value={value}
        />
    </Grid>
}

export default React.memo(SpanWidget)
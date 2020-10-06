import React from 'react';
import Grid from '@material-ui/core/Grid'
import { IconButton } from '@material-ui/core';
import { FaSearchMinus, FaSearchPlus, FaArrowLeft, FaArrowRight } from "react-icons/fa";

const TimeWidgetToolBar = ({ onZoomIn, onZoomOut, onShiftTimeLeft, onShiftTimeRight, customActions = [] }) => {
    let buttons = React.useMemo(() => [{
        type: 'button',
        title: "Time zoom in (+)",
        onClick: onZoomIn,
        icon: <FaSearchPlus />
    }, {
        type: 'button',
        title: "Time zoom out (-)",
        onClick: onZoomOut,
        icon: <FaSearchMinus />
    }, {
        type: 'button',
        title: "Shift time left [left arrow]",
        onClick: onShiftTimeLeft,
        icon: <FaArrowLeft />
    }, {
        type: 'button',
        title: "Shift time right [right arrow]",
        onClick: onShiftTimeRight,
        icon: <FaArrowRight />
    }, ...customActions.map(a => ({
        type: a.type || 'button',
        title: a.title,
        onClick: a.callback,
        icon: a.icon,
        selected: a.selected
    }))], [onZoomIn, onZoomOut, onShiftTimeLeft, onShiftTimeRight, customActions]);

    return (
        <Grid container justify="flex-end" alignItems="center">
            {
                buttons.map((button, ii) => {
                    if (button.type === 'button') {
                        let color = 'inherit';
                        if (button.selected) color = 'primary';
                        return (
                            <IconButton title={button.title} onClick={button.onClick} key={ii} color={color}>
                                {button.icon}
                            </IconButton>
                        );
                    }
                    else {
                        return <span />;
                    }
                })
            }
        </Grid>
    );

}

export default React.memo(TimeWidgetToolBar)
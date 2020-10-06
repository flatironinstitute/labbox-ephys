import React from 'react';
import Grid from '@material-ui/core/Grid'
import { IconButton } from '@material-ui/core';
import { ZoomInOutlined, ZoomOutOutlined, ArrowBackOutlined, ArrowForwardOutlined } from "@material-ui/icons";

const TimeWidgetToolBar = ({ onZoomIn, onZoomOut, onShiftTimeLeft, onShiftTimeRight, customActions = [] }) => {
    let buttons = React.useMemo(() => [{
        type: 'button',
        title: "Time zoom in (+)",
        onClick: onZoomIn,
        icon: <ZoomInOutlined />
    }, {
        type: 'button',
        title: "Time zoom out (-)",
        onClick: onZoomOut,
        icon: <ZoomOutOutlined />
    }, {
        type: 'button',
        title: "Shift time left [left arrow]",
        onClick: onShiftTimeLeft,
        icon: <ArrowBackOutlined />
    }, {
        type: 'button',
        title: "Shift time right [right arrow]",
        onClick: onShiftTimeRight,
        icon: <ArrowForwardOutlined />
    }, ...customActions.map(a => ({
        type: a.type || 'button',
        title: a.title,
        onClick: a.callback,
        icon: a.icon,
        selected: a.selected
    }))], [onZoomIn, onZoomOut, onShiftTimeLeft, onShiftTimeRight, customActions]);

    return (
        <Grid container justify="space-between" alignItems="center">
            <Grid item><h3>Test</h3></Grid>
            <Grid item>
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
        </Grid>
    );

}

export default React.memo(TimeWidgetToolBar)
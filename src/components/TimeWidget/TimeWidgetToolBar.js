import React, { Component } from 'react';

import { IconButton } from '@material-ui/core';
import { FaSearchMinus, FaSearchPlus, FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default class TimeWidgetToolBar extends Component {
    render() {
        const style0 = {
            position: 'relative',
            width: this.props.width,
            height: this.props.height,
            top: this.props.top,
            overflow: 'hidden'
        };
        let buttons = [];
        buttons.push({
            type: 'button',
            title: "Time zoom in (+)",
            onClick: this.props.onZoomIn,
            icon: <FaSearchPlus size="0.7em"/>
        });
        buttons.push({
            type: 'button',
            title: "Time zoom out (-)",
            onClick: this.props.onZoomOut,
            icon: <FaSearchMinus size="0.7em"/>
        });
        buttons.push({
            type: 'button',
            title: "Shift time left [left arrow]",
            onClick: this.props.onShiftTimeLeft,
            icon: <FaArrowLeft size="0.7em"/>
        });
        buttons.push({
            type: 'button',
            title: "Shift time right [right arrow]",
            onClick: this.props.onShiftTimeRight,
            icon: <FaArrowRight size="0.7em"/>
        });
        buttons.push({
            type: 'divider'
        });
        for (let a of this.props.customActions) {
            buttons.push({
                type: a.type || 'button',
                title: a.title,
                onClick: a.callback,
                icon: a.icon,
                selected: a.selected
            });
        }
        return (
            <div style={style0}>
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
                        else if (button.type === 'divider') {
                            return <hr key={ii} />;
                        }
                        else {
                            return <span />;
                        }
                    })
                }
            </div>
        );
    }
}
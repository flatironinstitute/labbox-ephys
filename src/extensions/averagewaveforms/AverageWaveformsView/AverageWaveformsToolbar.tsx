import { IconButton } from '@material-ui/core';
import React, { FunctionComponent } from 'react';

interface Props {
    width: number
    height: number
    customActions?: any[] | null
}

const AverageWaveformsToolbar: FunctionComponent<Props> = (props) => {
    const toolbarStyle = {
        width: props.width,
        height: props.height,
        overflow: 'hidden'
    };
    let buttons = [];
    for (let a of (props.customActions || [])) {
        buttons.push({
            type: a.type || 'button',
            title: a.title,
            onClick: a.callback,
            icon: a.icon,
            selected: a.selected
        });
    }
    return (
        <div className="AverageWaveformsToolBar" style={{position: 'absolute', ...toolbarStyle}}>
            {
                buttons.map((button, ii) => {
                    if (button.type === 'button') {
                        let color: 'inherit' | 'primary' = 'inherit';
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
                        return <span key={ii} />;
                    }
                })
            }
        </div>
    );
}

export default AverageWaveformsToolbar
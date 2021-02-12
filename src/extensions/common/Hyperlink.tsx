import React, { FunctionComponent } from 'react';

const Hyperlink: FunctionComponent<{onClick: () => void}> = (props) => {
    let style0 = {
        color: 'gray',
        cursor: 'pointer',
        textDecoration: 'underline'
    };
    return (
        <span
            style={style0}
            onClick={props.onClick}
        >
            {props.children}
        </span>
    );
}

export default Hyperlink
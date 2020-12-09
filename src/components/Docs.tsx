import React, { FunctionComponent } from 'react';
import Markdown from '../extensions/common/Markdown';
import docsMd from './docs.md.json';

const Docs: FunctionComponent<{}> = () => {
    return (
        <Markdown
            source={docsMd}
        />
    )
}

export default Docs
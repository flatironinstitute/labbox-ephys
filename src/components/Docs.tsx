import React, { FunctionComponent } from 'react';
import Markdown from '../python/labbox_ephys/extensions/common/Markdown';
import docsMd from './docs.md.gen';

const Docs: FunctionComponent<{}> = () => {
    return (
        <div style={{padding: 20}}>
            <Markdown
                source={docsMd}
            />
        </div>
    )
}

export default Docs
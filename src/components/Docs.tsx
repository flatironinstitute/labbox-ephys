import raw from "raw.macro";
import React, { FunctionComponent } from 'react';
import Markdown from '../extensions/common/Markdown';
const docsMd = raw("./docs.md");
const dummy = 'reload-1'

interface Props {

}

const Docs: FunctionComponent<Props> = (props) => {
    return (
        <Markdown
            source={docsMd}
        />
    )
}

export default Docs
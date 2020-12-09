import 'github-markdown-css'
import React, { FunctionComponent } from 'react'
import ReactMarkdown from "react-markdown"
import MarkdownCodeBlock from "./MarkdownCodeBlock"

interface Props {
    source: string
}

const Markdown: FunctionComponent<Props> = ({source}) => {
    return (
        <div className='markdown-body'>
            <ReactMarkdown
                source={source}
                renderers={{ code: MarkdownCodeBlock }}
            />
        </div>
    );
}

export default Markdown
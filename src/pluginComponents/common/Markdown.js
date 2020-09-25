import React from 'react'
import ReactMarkdown from "react-markdown"
import MarkdownCodeBlock from "./MarkdownCodeBlock"
import 'github-markdown-css'

const Markdown = ({source}) => {
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
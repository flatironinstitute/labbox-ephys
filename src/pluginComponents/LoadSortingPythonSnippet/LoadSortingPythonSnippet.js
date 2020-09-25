import React from 'react'
import Markdown from '../common/Markdown'
import raw from "raw.macro"; 
const snippetMd = raw("./load_sorting.md");
const dummy = 'reload-1'


const LoadSortingPythonSnippet = ({ size, sorting, recording, selectedUnitIds, documentInfo }) => {
    const substitute = (md) => {
        let ret = md;
        ret = ret.replace('<SORTING_PATH>', sorting.sortingPath);
        return ret;
    }
    return (
        <Markdown
            source={substitute(snippetMd)}
        />
    )
}

const label = 'Load sorting in Python'

LoadSortingPythonSnippet.sortingViewPlugin = {
    label: label
}

export default LoadSortingPythonSnippet;
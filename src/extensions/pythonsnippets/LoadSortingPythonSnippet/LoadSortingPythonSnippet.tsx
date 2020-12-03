import raw from "raw.macro";
import React, { FunctionComponent } from 'react';
import sizeMe from 'react-sizeme';
import { SortingViewProps } from '../../../extension';
import Markdown from '../../common/Markdown';
const snippetMd = raw("./load_sorting.md");
const dummy = 'reload-1'


const LoadSortingPythonSnippet: FunctionComponent<SortingViewProps & {size: {width: number}}> = ({ size, sorting, recording, selectedUnitIds, documentInfo }) => {
    const substitute = (md: string) => {
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

export default sizeMe()(LoadSortingPythonSnippet)
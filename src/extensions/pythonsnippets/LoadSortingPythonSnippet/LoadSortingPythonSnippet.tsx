import raw from "raw.macro";
import React, { FunctionComponent } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import Markdown from '../../common/Markdown';
import { SortingViewProps } from '../../extensionInterface';
const snippetMd = raw("./load_sorting.md");
const dummy = 'reload-1'


const LoadSortingPythonSnippet: FunctionComponent<SortingViewProps & SizeMeProps> = ({ size, sorting, recording, selectedUnitIds }) => {
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
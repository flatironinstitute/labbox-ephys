import React, { FunctionComponent } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import Markdown from '../../common/Markdown';
import { SortingViewProps } from '../../extensionInterface';
import snippetMd from './load_sorting.md.gen';


const LoadSortingPythonSnippet: FunctionComponent<SortingViewProps & SizeMeProps> = ({ size, sorting, recording }) => {
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
import React from 'react'
// import MatplotlibPlot from '../../components/MatplotlibPlot';

const AutoCorrelograms = ({ sortingPath, recordingPath }) => {
    return (
        <div>
            <h3>Not yet implemented</h3>
            <p>
                {sortingPath} {recordingPath}
            </p>
        </div>
        
    );
}

AutoCorrelograms.sortingViewPlugin = {
    label: 'Autocorrelograms - not yet implemented'
}

AutoCorrelograms.prototypeViewPlugin = {
    label: 'Autocorrelograms - not yet implemented',
    props: {
        sortingPath: 'test',
        recordingPath: 'test2'
    }
}

export default AutoCorrelograms
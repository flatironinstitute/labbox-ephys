import React, { FunctionComponent } from 'react';
import Markdown from '../extensions/common/Markdown';
import aboutMd from './about.md.gen';

interface Props {

}

const About: FunctionComponent<Props> = (props) => {
    return (
        <div style={{padding: 20}}>
            <Markdown
                source={aboutMd}
            />
        </div>
    )
}

export default About

// import { Typography } from '@material-ui/core';
// import React from 'react';
// import './About.css';


// function Home() {
//     return (
//         <div>
//             <Typography component="p">
//                 Analysis and visualization of neurophysiology recordings and spike sorting results.
//             </Typography>
//             <p />
//             <Typography component="p">
//                 Project home:
//                 {" "}<a href="https://github.com/laboratorybox/labbox-ephys" target="_blank" rel="noopener noreferrer">labbox-ephys</a>
//             </Typography>
//             <p />
//             <Typography component="p">
//                 Authors: Jeremy Magland and Jeff Soules, Center for Computational Mathematics, Flatiron Institute
//             </Typography>
//         </div>
//     );
// }

// export default Home;

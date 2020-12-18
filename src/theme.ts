// LABBOX-CUSTOM ////////////////
import { deepPurple, indigo } from '@material-ui/core/colors';
import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';


const themeOptions: ThemeOptions = {
    palette: {
        primary: deepPurple,
        secondary: indigo,
    },
    overrides: {
        // MuiTableCell: {
        //     root: {  //This can be referred from Material UI API documentation. 
        //         padding: '4px 8px',
        //         backgroundColor: "#fafafa",
        //     }
        // },
    },
}
/////////////////////////////////

const theme = createMuiTheme(themeOptions);

export default theme;
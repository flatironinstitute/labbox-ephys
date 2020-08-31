import { createMuiTheme } from '@material-ui/core/styles';

// LABBOX-CUSTOM ////////////////
import { indigo } from '@material-ui/core/colors';

export const theme = (mode) =>
    createMuiTheme({
        palette: {
            type: mode,
            main: {
                primary: mode === 'light' ? '#0CB4CE' : '#121212',
                secondary: indigo,
            },
            colors: {
                white: '#fff'
            }
        }
    });



export default theme;
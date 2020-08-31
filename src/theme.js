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
                white: '#fff',
                lightBlue: 'rgba(12, 180, 206, 1)',
                lightBlue1: 'rgba(12, 180, 206, 0.3)',
                lightBlue2: 'rgba(12, 180, 206, 0.05)'
            }
        }
    });



export default theme;
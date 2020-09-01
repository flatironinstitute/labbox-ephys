import { createMuiTheme } from '@material-ui/core/styles';

export const theme = (mode) =>
    createMuiTheme({
        palette: {
            type: mode,
            primary: {
                main: mode === 'light' ? '#0CB4CE' : '#121212',
            },
            secondary: {
                main: mode === 'light' ? '#0CB4CE' : '#121212',
            },
            colors: {
                white: '#fff',
                lightBlue: 'rgba(12, 180, 206, 1)',
                lightBlue1: 'rgba(12, 180, 206, 0.3)',
                lightBlue2: 'rgba(12, 180, 206, 0.05)',
                grey: '#666666',
                grey2: 'rgba(0, 0, 0, 0.38)',
                red: '#FF0C3E'
            }
        }
    });



export default theme;
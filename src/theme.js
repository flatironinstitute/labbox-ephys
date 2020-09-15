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
                grey3: 'rgba(0, 0, 0, 0.12)',
                red: '#FF0C3E',
                green: '#58B744',
                lightGreen: 'rgba(88, 183, 68, 0.5)',
                darkGrey: 'rgba(0, 0, 0, 0.6)',
                darkWhite: 'rgba(255, 255, 255, 0.7)',
                purple: '#AB47BC',
                mainColor: '#0CB4CE',
                orange: '#FF9800'
            }
        }
    });



export default theme;
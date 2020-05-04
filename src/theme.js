import { createMuiTheme } from '@material-ui/core/styles';

// LABBOX-CUSTOM ////////////////
import { deepPurple, indigo } from '@material-ui/core/colors';

const themeOptions = {
    palette: {
        primary: deepPurple,
        secondary: indigo,
    }
}
/////////////////////////////////

const theme = createMuiTheme(themeOptions);

export default theme;
import { createTheme, Theme } from '@mui/material/styles';

declare module "@mui/material/styles" {
    interface Palette {
        custom: {
            link: string;
        }
    }
    interface PaletteOptions {
        custom: {
            link: string;
        }
    }
}


// https://mui.com/material-ui/customization/palette/
export const theme: Theme = createTheme({
    palette: {
        primary: {
            main: "#1E201D",
            contrastText: "#ffffff"
        },
        secondary: {
            main: "#f57c00",
            contrastText: "#ffffff"
        },
        custom: {
            link: "#3366CC"
        },
    },
    typography: {
        fontFamily: '"Dejavu Mono", monospace',
    },
});




export default theme;
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		primary: {
			main: "#007bff",
			light: "#3395ff",
			dark: "#0056b3",
			contrastText: "#fff",
		},
		secondary: {
			main: "#6c757d",
			light: "#868e96",
			dark: "#495057",
			contrastText: "#fff",
		},
		success: {
			main: "#28a745",
			light: "#48b461",
			dark: "#1e7e34",
			contrastText: "#fff",
		},
		error: {
			main: "#dc3545",
			light: "#e35d6a",
			dark: "#bd2130",
			contrastText: "#fff",
		},
		warning: {
			main: "#ffc107",
			light: "#ffcd38",
			dark: "#d39e00",
			contrastText: "#000",
		},
		info: {
			main: "#17a2b8",
			light: "#45b5c6",
			dark: "#117a8b",
			contrastText: "#fff",
		},
		background: {
			default: "#ffffff",
			paper: "#f8f9fa",
		},
	},
	typography: {
		fontFamily: [
			"-apple-system",
			"BlinkMacSystemFont",
			'"Segoe UI"',
			"Roboto",
			'"Helvetica Neue"',
			"Arial",
			"sans-serif",
		].join(","),
		h1: {
			fontSize: "2.5rem",
			fontWeight: 500,
		},
		h2: {
			fontSize: "2rem",
			fontWeight: 500,
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 500,
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: 500,
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: 500,
		},
		h6: {
			fontSize: "1rem",
			fontWeight: 500,
		},
	},
	shape: {
		borderRadius: 5,
	},
	spacing: 8,
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					fontWeight: 500,
				},
			},
			defaultProps: {
				disableElevation: true,
			},
		},
		MuiTextField: {
			defaultProps: {
				variant: "outlined",
				size: "small",
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 5,
				},
			},
		},
	},
});

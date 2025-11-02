import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import "./theme.types"; // Import type augmentations

/**
 * Base theme configuration shared across light and dark modes
 */
const baseThemeConfig = {
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
					textTransform: "none" as const,
					fontWeight: 500,
				},
			},
			defaultProps: {
				disableElevation: true,
			},
		},
		MuiTextField: {
			defaultProps: {
				variant: "outlined" as const,
				size: "small" as const,
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
};

/**
 * Creates a theme with the specified mode (light or dark)
 * Preserves all component overrides and customizations
 */
export const createAppTheme = (mode: PaletteMode = "light") => {
	return createTheme({
		...baseThemeConfig,
		palette: {
			mode,
			...(mode === "light"
				? {
						// Light mode colors
						primary: {
							main: "#007bff",
							light: "#4da3ff",
							dark: "#0056b3",
							lighter: "rgba(0, 123, 255, 0.08)", // For hover/selected states
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
							lighter: "rgba(40, 167, 69, 0.08)",
							contrastText: "#fff",
						},
						error: {
							main: "#dc3545",
							light: "#e35d6a",
							dark: "#bd2130",
							lighter: "rgba(220, 53, 69, 0.08)",
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
							default: "#f5f5f5",
							paper: "#ffffff",
						},
						text: {
							primary: "#212121",
							secondary: "#666666",
							disabled: "#9e9e9e",
						},
				  }
				: {
						// Dark mode colors
						primary: {
							main: "#4da3ff",
							light: "#80bdff",
							dark: "#007bff",
							lighter: "rgba(77, 163, 255, 0.12)",
						},
						secondary: {
							main: "#868e96",
							light: "#adb5bd",
							dark: "#6c757d",
							contrastText: "#fff",
						},
						success: {
							main: "#48b461",
							light: "#6ec283",
							dark: "#28a745",
							lighter: "rgba(72, 180, 97, 0.12)",
							contrastText: "#fff",
						},
						error: {
							main: "#e35d6a",
							light: "#e97c86",
							dark: "#dc3545",
							lighter: "rgba(227, 93, 106, 0.12)",
							contrastText: "#fff",
						},
						warning: {
							main: "#ffcd38",
							light: "#ffd966",
							dark: "#ffc107",
							contrastText: "#000",
						},
						info: {
							main: "#45b5c6",
							light: "#6dc4d2",
							dark: "#17a2b8",
							contrastText: "#fff",
						},
						background: {
							default: "#121212",
							paper: "#1e1e1e",
						},
						text: {
							primary: "#ffffff",
							secondary: "#b0b0b0",
							disabled: "#666666",
						},
				  }),
		},
	});
};

/**
 * Default light theme (for backwards compatibility)
 */
export const theme = createAppTheme("light");

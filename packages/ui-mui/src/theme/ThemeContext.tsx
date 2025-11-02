import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "./theme.config";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
	mode: ThemeMode;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useThemeMode must be used within ThemeContextProvider");
	}
	return context;
};

interface ThemeContextProviderProps {
	children: React.ReactNode;
}

export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
	// Initialize from localStorage or default to light
	const [mode, setMode] = useState<ThemeMode>(() => {
		const savedMode = localStorage.getItem("theme-mode");
		return (savedMode as ThemeMode) || "light";
	});

	// Persist to localStorage when mode changes
	useEffect(() => {
		localStorage.setItem("theme-mode", mode);
	}, [mode]);

	const toggleTheme = () => {
		setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
	};

	// Create theme based on mode using the centralized createAppTheme function
	// This preserves all component overrides, typography, and other customizations
	const theme = useMemo(() => createAppTheme(mode), [mode]);

	return (
		<ThemeContext.Provider value={{ mode, toggleTheme }}>
			<MuiThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</ThemeContext.Provider>
	);
};

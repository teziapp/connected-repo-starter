/**
 * Theme type augmentation for Material-UI
 * Extends the default MUI palette to include custom properties
 */

import "@mui/material/styles";

declare module "@mui/material/styles" {
	interface PaletteColor {
		/**
		 * Lighter shade for hover/selected states
		 * Uses rgba with low opacity for backgrounds
		 */
		lighter?: string;
	}

	interface SimplePaletteColorOptions {
		/**
		 * Lighter shade for hover/selected states
		 * Uses rgba with low opacity for backgrounds
		 */
		lighter?: string;
	}
}

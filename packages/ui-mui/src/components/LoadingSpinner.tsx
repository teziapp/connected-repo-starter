import Box from "@mui/material/Box";
import type { CircularProgressProps } from "@mui/material/CircularProgress";
import CircularProgress from "@mui/material/CircularProgress";

export interface LoadingSpinnerProps extends CircularProgressProps {
	text?: string;
}

const LoadingSpinner = ({ text, ...props }: LoadingSpinnerProps) => {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
			<CircularProgress size={24} {...props} />
			{text && <span>{text}</span>}
		</Box>
	);
}
export default LoadingSpinner;

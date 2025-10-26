import type { AlertProps } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";

export interface ErrorAlertProps extends Omit<AlertProps, "severity"> {
	message: string;
}

const ErrorAlert = ({ message, ...props }: ErrorAlertProps) => {
	if (!message) return null;

	return (
		<Alert severity="error" sx={{ mt: 2 }} {...props}>
			{message}
		</Alert>
	);
}
export default ErrorAlert;

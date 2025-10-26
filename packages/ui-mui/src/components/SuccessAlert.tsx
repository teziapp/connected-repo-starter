import type { AlertProps } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";

export interface SuccessAlertProps extends Omit<AlertProps, "severity"> {
	message: string;
}

export const SuccessAlert = ({ message, ...props }: SuccessAlertProps) => {
	if (!message) return null;

	return (
		<Alert severity="success" sx={{ mt: 2 }} {...props}>
			{message}
		</Alert>
	);
}

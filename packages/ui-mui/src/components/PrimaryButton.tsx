import type { ButtonProps } from "@mui/material/Button";
import Button from "@mui/material/Button";

export interface PrimaryButtonProps extends ButtonProps {
	loading?: boolean;
}

export const PrimaryButton = ({
	loading = false,
	disabled,
	children,
	...props
}: PrimaryButtonProps) => {
	return (
		<Button
			variant="contained"
			color="primary"
			disabled={disabled || loading}
			{...props}
		>
			{loading ? "Loading..." : children}
		</Button>
	);
};

import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";

export interface SecondaryButtonProps extends ButtonProps {
	loading?: boolean;
}

export function SecondaryButton({
	loading = false,
	disabled,
	children,
	...props
}: SecondaryButtonProps) {
	return (
		<Button
			variant="outlined"
			color="secondary"
			disabled={disabled || loading}
			{...props}
		>
			{loading ? "Loading..." : children}
		</Button>
	);
}

import MuiToggleButton, { ToggleButtonProps as MuiToggleButtonProps } from "@mui/material/ToggleButton";

export type ToggleButtonProps = MuiToggleButtonProps;

export function ToggleButton(props: ToggleButtonProps) {
	return <MuiToggleButton {...props} />;
}

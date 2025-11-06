import MuiToggleButtonGroup, { ToggleButtonGroupProps as MuiToggleButtonGroupProps } from "@mui/material/ToggleButtonGroup";

export type ToggleButtonGroupProps = MuiToggleButtonGroupProps;

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
	return <MuiToggleButtonGroup {...props} />;
}

import type { SxProps, Theme } from "@mui/material/styles";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  type FormControlLabelProps,
  FormHelperText,
} from "../form/FormControl";
import { Switch, type SwitchProps } from "../form/Switch";

export interface RhfSwitchProps {
  name: string;
  label: string;
  switchProps?: SwitchProps;
  formControlLabelProps?: Omit<FormControlLabelProps, "control" | "label">;
  sx?: SxProps<Theme>;
}

export const RhfSwitch = ({
  name,
  label,
  switchProps,
  formControlLabelProps,
  sx,
}: RhfSwitchProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <FormControl
          error={!!error}
          fullWidth
          sx={{
            // Base styling
            mb: { xs: 1.5, md: 2 },
            // Custom styling override
            ...sx,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                {...switchProps}
              />
            }
            label={label}
            sx={{
              ml: 0,
              alignItems: "flex-start",
            }}
            {...formControlLabelProps}
          />
          {error && (
            <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

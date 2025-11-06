import type { SxProps, Theme } from "@mui/material/styles";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox, type CheckboxProps } from "../form/Checkbox";
import {
  FormControl,
  FormControlLabel,
  type FormControlLabelProps,
  FormHelperText,
} from "../form/FormControl";

export interface RhfCheckboxProps {
  name: string;
  label: string;
  checkboxProps?: CheckboxProps;
  formControlLabelProps?: Omit<FormControlLabelProps, "control" | "label">;
  sx?: SxProps<Theme>;
}

export const RhfCheckbox = ({
  name,
  label,
  checkboxProps,
  formControlLabelProps,
  sx,
}: RhfCheckboxProps) => {
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
              <Checkbox
                {...field}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                {...checkboxProps}
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

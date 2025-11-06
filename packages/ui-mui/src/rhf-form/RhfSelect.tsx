import type { SxProps, Theme } from "@mui/material/styles";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormHelperText,
  InputLabel,
} from "../form/FormControl";
import { MenuItem } from "../form/MenuItem";
import { Select, type SelectProps } from "../form/Select";

export interface RhfSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RhfSelectProps extends Omit<SelectProps, "name"> {
  name: string;
  label?: string;
  options: RhfSelectOption[];
  placeholder?: string;
  sx?: SxProps<Theme>;
}

export const RhfSelect = ({
  name,
  label,
  options,
  placeholder,
  sx,
  ...props
}: RhfSelectProps) => {
  const { control } = useFormContext();
  const labelId = label ? `${name}-label` : undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          fullWidth
          error={!!error}
          sx={{
            // Base styling
            mb: { xs: 2, md: 2.5 },
            // Custom styling override
            ...sx,
          }}
        >
          {label && <InputLabel id={labelId}>{label}</InputLabel>}
          <Select
            {...field}
            labelId={labelId}
            label={label}
            displayEmpty={!!placeholder}
            sx={{
              "& .MuiSelect-select": {
                fontSize: { xs: "16px", md: "14px" }, // Prevent iOS zoom on focus
              },
            }}
            {...props}
          >
            {placeholder && (
              <MenuItem value="" disabled>
                <em>{placeholder}</em>
              </MenuItem>
            )}
            {options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

import type { SxProps, Theme } from "@mui/material/styles";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
} from "../form/FormControl";
import { Radio, RadioGroup, type RadioGroupProps } from "../form/Radio";

export interface RhfRadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RhfRadioProps extends Omit<RadioGroupProps, "name"> {
  name: string;
  label?: string;
  options: RhfRadioOption[];
  sx?: SxProps<Theme>;
}

export const RhfRadio = ({
  name,
  label,
  options,
  sx,
  ...props
}: RhfRadioProps) => {
  const { control } = useFormContext();

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
          {label && <FormLabel>{label}</FormLabel>}
          <RadioGroup {...field} {...props}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                disabled={option.disabled}
                sx={{
                  ml: 0,
                }}
              />
            ))}
          </RadioGroup>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

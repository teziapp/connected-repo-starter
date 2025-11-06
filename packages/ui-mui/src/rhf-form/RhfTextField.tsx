import type { SxProps, Theme } from "@mui/material/styles";
import { Controller, useFormContext } from "react-hook-form";
import { TextField, type TextFieldProps } from "../form/TextField";

export interface RhfTextFieldProps extends Omit<TextFieldProps, "name"> {
  name: string;
  sx?: SxProps<Theme>;
}

export const RhfTextField = ({ name, sx, ...props }: RhfTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          fullWidth
          error={!!error}
          helperText={error?.message || props.helperText}
          sx={{
            // Base styling
            mb: { xs: 2, md: 2.5 },
            "& .MuiInputBase-input": {
              fontSize: { xs: "16px", md: "14px" }, // Prevent iOS zoom on focus
            },
            // Custom styling override
            ...sx,
          }}
        />
      )}
    />
  );
};

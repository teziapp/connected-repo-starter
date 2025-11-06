import { useFormState } from "react-hook-form";
import { Button, ButtonProps } from "../form/Button";

export interface RhfSubmitButtonProps {
  props?: ButtonProps;
  isSubmittingText?: string;
  notSubmittingText?: string;
}

export const RhfSubmitButton = ({
  props,
  isSubmittingText = "Submitting...",
  notSubmittingText = "Submit",
}: RhfSubmitButtonProps) => {
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      disabled={isSubmitting}
      sx={{
        py: 1.5,
        fontSize: "1.1rem",
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 2,
        boxShadow: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
        "&:active": {
          transform: "translateY(0)",
          boxShadow: 2,
        },
      }}
      {...props}
    >
      {isSubmitting ? isSubmittingText : notSubmittingText}
    </Button>
  );
};
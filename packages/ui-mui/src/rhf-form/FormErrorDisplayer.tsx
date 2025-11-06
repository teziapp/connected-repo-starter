import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { List, ListItem, ListItemIcon, ListItemText } from "../data-display/List";
import { Alert } from "../feedback/Alert";
import { AlertTitle } from "../feedback/AlertTitle";
import { Collapse } from "../feedback/Collapse";
import { ErrorOutlineIcon } from "../icons/ErrorOutlineIcon";
import { Box } from "../layout/Box";

export interface FormErrorDisplayerProps {
  showFieldErrors?: boolean;
  maxErrors?: number;
  title?: string;
  severity?: "error" | "warning";
}

export const FormErrorDisplayer = ({
  showFieldErrors = true,
  maxErrors = 5,
  title = "Please fix the following errors:",
  severity = "error",
}: FormErrorDisplayerProps) => {
  const {
    formState: { errors },
  } = useFormContext();

  // Collect all errors (root + field errors)
  const errorMessages = useMemo(() => {
    const messages: Array<{ key: string; message: string }> = [];

    // Add root error if exists
    if (errors.root?.message) {
      messages.push({
        key: "root",
        message: String(errors.root.message),
      });
    }

    // Add field errors if enabled
    if (showFieldErrors) {
      Object.entries(errors).forEach(([field, error]) => {
        if (field !== "root" && error?.message) {
          // Format field name: "firstName" -> "First Name"
          const formattedField = field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();

          messages.push({
            key: field,
            message: `${formattedField}: ${String(error.message)}`,
          });
        }
      });
    }

    // Limit to maxErrors
    return messages.slice(0, maxErrors);
  }, [errors, showFieldErrors, maxErrors]);

  const hasErrors = errorMessages.length > 0;

  return (
    <Collapse
      in={hasErrors}
      unmountOnExit
      timeout={300}
      sx={{
        mb: hasErrors ? 3 : 0,
      }}
    >
      <Alert
        severity={severity}
        variant="outlined"
        icon={<ErrorOutlineIcon />}
        sx={{
          borderRadius: 2,
          borderWidth: 2,
          animation: "slideDown 0.3s ease-out",
          "@keyframes slideDown": {
            from: {
              opacity: 0,
              transform: "translateY(-20px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>{title}</AlertTitle>

        {errorMessages.length === 1 ? (
          // Single error: display inline
          <Box sx={{ color: "text.primary" }}>{errorMessages[0]?.message}</Box>
        ) : (
          // Multiple errors: display as list
          <List
            dense
            disablePadding
            sx={{
              "& .MuiListItem-root": {
                px: 0,
                py: 0.5,
              },
            }}
          >
            {errorMessages.map(({ key, message }) => (
              <ListItem key={key} disableGutters>
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: severity === "error" ? "error.main" : "warning.main",
                  }}
                >
                  <ErrorOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={message}
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "text.primary",
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {Object.keys(errors).length > maxErrors && (
          <Box
            sx={{
              mt: 1,
              pt: 1,
              borderTop: 1,
              borderColor: "divider",
              color: "text.secondary",
              fontSize: "0.875rem",
            }}
          >
            + {Object.keys(errors).length - maxErrors} more error
            {Object.keys(errors).length - maxErrors !== 1 ? "s" : ""}
          </Box>
        )}
      </Alert>
    </Collapse>
  );
};

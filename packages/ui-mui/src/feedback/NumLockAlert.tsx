import { useEffect, useState } from "react";
import { CloseIcon } from "../icons/CloseIcon";
import { Box } from "../layout/Box";
import { IconButton } from "../navigation/IconButton";
import { Alert } from "./Alert";
import { AlertTitle } from "./AlertTitle";
import { Collapse } from "./Collapse";

/**
 * NumLockAlert - Displays a non-intrusive alert when Num Lock is enabled
 */
export const NumLockAlert = () => {
  const [numLockOn, setNumLockOn] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      // Check if getModifierState is available (not all browsers support it)
      if (typeof e.getModifierState === "function") {
        const isNumLockOn = e.getModifierState("NumLock");
        setNumLockOn(isNumLockOn);

        // Reset dismissed state when Num Lock state changes
        if (!isNumLockOn) {
          setDismissed(false);
        }
      }
    };

    // Listen to keydown events to detect Num Lock state
    window.addEventListener("keydown", handleKeyEvent);
    window.addEventListener("keyup", handleKeyEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyEvent);
      window.removeEventListener("keyup", handleKeyEvent);
    };
  }, []);

  const shouldShow = numLockOn && !dismissed;

  return (
    <Collapse in={shouldShow} unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1400,
          maxWidth: { xs: "calc(100% - 32px)", sm: 400 },
        }}
      >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            borderRadius: 2,
            animation: "slideInRight 0.3s ease-out",
            "@keyframes slideInRight": {
              from: {
                opacity: 0,
                transform: "translateX(100%)",
              },
              to: {
                opacity: 1,
                transform: "translateX(0)",
              },
            },
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setDismissed(true)}
              sx={{
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Num Lock is ON</AlertTitle>
          You may have trouble entering numbers. Press Num Lock to toggle it off.
        </Alert>
      </Box>
    </Collapse>
  );
};

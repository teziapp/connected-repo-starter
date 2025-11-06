import { useCallback } from "react";
import { type FieldValues, FormProvider, type UseFormReturn } from "react-hook-form";
import { NumLockAlert } from "../feedback/NumLockAlert";
import { FormErrorDisplayer, type FormErrorDisplayerProps } from "./FormErrorDisplayer";

export interface RhfFormProviderProps<T extends FieldValues> {
  children: React.ReactNode;
  errorDisplayer?: {
    show: boolean;
    props?: FormErrorDisplayerProps;
  };
  numLockAlert?: boolean;
  formMethods: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void>;
  onInvalid?: (errors: UseFormReturn<T>["formState"]["errors"]) => void;
  onError?: (error: unknown) => void;
  clearRootErrorOnChange?: boolean;
}

export const RhfFormProvider = <T extends FieldValues>({
  formMethods,
  onSubmit,
  errorDisplayer = {
    show: true
  },
  numLockAlert = true,
  children,
  onInvalid,
  onError,
  clearRootErrorOnChange = true,
}: RhfFormProviderProps<T>) => {
  const { handleSubmit, setError, clearErrors, watch } = formMethods;

  // Clear root errors when form data changes (optional)
  if (clearRootErrorOnChange) {
    watch(() => {
      if (formMethods.formState.errors.root) {
        clearErrors("root");
      }
    });
  }

  /**
   * Handler for valid form submissions
   * Catches errors from the onSubmit promise and sets them as root errors
   */
  const onValid = useCallback(
    async (data: T) => {
      try {
        await onSubmit(data);
      } catch (error: unknown) {
        // Log error for debugging
        console.error("Form submission error:", error);

        // Set as root error for display
        setError("root", {
          message: error instanceof Error ? error.message : "Form submission failed. Please try again.",
        });

        // Call optional error callback
        if (onError) {
          onError(error);
        }
      }
    },
    [onSubmit, setError, onError]
  );

  /**
   * Handler for invalid form submissions (validation failures)
   * Logs validation errors and optionally calls onInvalid callback
   */
  const onInvalidSubmit = useCallback(
    (errors: typeof formMethods.formState.errors) => {
      // Log validation errors for debugging
      console.error("Form validation errors:", {
        errors,
        values: formMethods.getValues(),
      });

      // Call optional invalid callback
      if (onInvalid) {
        onInvalid(errors);
      }
    },
    [onInvalid, formMethods]
  );

  return (
    <FormProvider {...formMethods}>
      {numLockAlert && <NumLockAlert />}

      <form onSubmit={handleSubmit(onValid, onInvalidSubmit)} noValidate>
        {errorDisplayer && <FormErrorDisplayer {...errorDisplayer?.props} />}
        {children}
      </form>
    </FormProvider>
  );
};

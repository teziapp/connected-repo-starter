import { type ReactNode, useMemo } from "react";
import { type FieldValues, type UseFormProps, useForm } from "react-hook-form";
import { FormErrorDisplayerProps } from "./FormErrorDisplayer";
import { RhfFormProvider, type RhfFormProviderProps } from "./RhfFormProvider";

export interface UseRhfFormProps<T extends FieldValues> {
  onSubmit: (data: T) => Promise<void>;
  errorDisplayer?: {
    show: boolean;
    props?: FormErrorDisplayerProps;
  }
  numLockAlert?: boolean;
  onInvalid?: RhfFormProviderProps<T>["onInvalid"];
  onError?: RhfFormProviderProps<T>["onError"];
  clearRootErrorOnChange?: boolean;
  formConfig?: UseFormProps<T>;
}

export const useRhfForm = <T extends FieldValues>({
  onSubmit,
  errorDisplayer = {
    show: true,
  },
  numLockAlert = true,
  onInvalid,
  onError,
  clearRootErrorOnChange = true,
  formConfig,
}: UseRhfFormProps<T>) => {
  // Initialize React Hook Form with provided config
  const formMethods = useForm<T>({
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    delayError: 500,
    ...formConfig
  });

  // Memoize the FormProvider component to prevent unnecessary re-renders
  const FormProviderComponent = useMemo(
    () =>
      ({ children }: { children: ReactNode }) => {
        return (
          <RhfFormProvider
            formMethods={formMethods}
            onSubmit={onSubmit}
            errorDisplayer={errorDisplayer}
            numLockAlert={numLockAlert}
            onInvalid={onInvalid}
            onError={onError}
            clearRootErrorOnChange={clearRootErrorOnChange}
          >
            {children}
          </RhfFormProvider>
        );
      },
    [
      formMethods,
      onSubmit,
      errorDisplayer,
      numLockAlert,
      onInvalid,
      onError,
      clearRootErrorOnChange,
    ]
  );

  return {
    formMethods,
    RhfFormProvider: FormProviderComponent,
  };
};

import { useErrorStore } from "~/stores/error-store";
import type { AppError } from "~/stores/error-store";

function catchError(error: any, title: string = "An Error Occurred") {
  const errorStore = useErrorStore();

  const errorDetails: Omit<AppError, "id" | "timestamp"> = {
    type: "general",
    title,
    message: error.message || "An unknown error occurred.",
    details: error,
  };

  errorStore.addError(errorDetails);
}

export const errorHandler = {
  catch: catchError,
};

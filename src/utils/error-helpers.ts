// src/utils/error-helpers.ts
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "An unknown error occurred";
};

export const getErrorDetails = (error: unknown): any => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return error;
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("fetch") ||
      error.message.toLowerCase().includes("connection")
    );
  }
  return false;
};

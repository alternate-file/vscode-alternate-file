/**
 * A standardized error type for failures to find alternate files.
 */
export interface t {
  message: string;
  startingFile: string;
  alternatesAttempted?: string[];
}

export const isAlternateFileNotFoundError = (error: t | any): error is t =>
  error.message !== undefined;

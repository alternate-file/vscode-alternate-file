/**
 * A standardized error type for failures to find alternate files.
 */
export interface t {
  message: string;
  startingFile: string;
  alternatesAttempted?: string[];
}

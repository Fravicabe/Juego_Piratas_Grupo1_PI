export interface DataValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates the JSON content files against their schemas and cross-file rules.
 * Implemented in `validate-data.mjs` so it can run with plain Node in CI.
 */
export function validateData(): DataValidationResult;

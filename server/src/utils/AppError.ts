/**
 * Custom error class for API errors.
 * Purpose: Throw errors with HTTP status codes (e.g., 404 Not Found, 401 Unauthorized).
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

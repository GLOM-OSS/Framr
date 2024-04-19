/**
 * IDB Error class
 */
export class FramrServiceError extends Error {
  /**
   * IDB Error class constructor
   * @param message The error message
   * @param context The name of the method where the error was thrown
   */
  constructor(message: string) {
    const errorMessage = `FramrServiceError: ${message}`;
    super(errorMessage);
  }
}

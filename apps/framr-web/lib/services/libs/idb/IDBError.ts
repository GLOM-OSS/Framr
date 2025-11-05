import { MethodNames } from './IDBFactory.types';

/**
 * IDB Error class
 */
export class IDBError extends Error {
  /**
   * IDB Error class constructor
   * @param message The error message
   * @param context The name of the method where the error was thrown
   */
  constructor(message: string, context?: MethodNames) {
    const errorMessage = `IDBError: ${message}`;
    if (context)
      console.warn(`Error occurred in method <${context}>\n ${errorMessage}`);

    super(errorMessage);
  }
}

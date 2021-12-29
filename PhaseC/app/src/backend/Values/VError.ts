import { IValue } from './IValue';

/**
 * To represent the Primitve type of a value for error
 */
export class VError implements IValue {
  private message: string;

  /**
   * to construct a VError
   * 
   * @param message to represent the error message of this VError
   */
  constructor(message: string) {
    this.message = message;
  }

  /**
   * to convert the value of this VError into a string
   * 
   * @returns a string represening the value of this VError
   */
  valueToString(): string {
    return this.message;
  }

  /**
   * gets copy of the IValue
   * @returns IValue
   */
  getCopy(): IValue {
    return new VError(this.message);
  }

  /**
   * Checks if IValue is a number
   * @returns boolean
   */
  isNumber(): boolean {
    return false;
  }

  /**
   * Checks if IValue is empty 
   * @returns boolean
   */
  isEmpty(): boolean {
    return false;
  }

  /**
   * Checks if IValue is a string
   * @returns boolean
   */
  isString(): boolean {
    return false;
  }

  /**
   * 
   * @returns Checks if IValue is an Error
   */
  isError(): boolean {
    return true;
  }
}

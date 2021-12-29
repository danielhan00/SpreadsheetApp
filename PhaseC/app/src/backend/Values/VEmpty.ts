import { IValue } from './IValue';

/**
 * To represent the Primitve type of a value for empty
 */
export class VEmpty implements IValue {
  private value: string = '';

  /**
   * to construct a Primitive type Empty
   */
  constructor() {}

  /**
   * to get the value of this Empty
   *
   * @returns this string's value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * to turn the value of this VEmpty into a string
   * 
   * @returns a string represening the value of this Empty
   */
  valueToString(): string {
    return this.getValue();
  }

  /**
   * to get a copy of this VEmpty
   * 
   * @returns a copy of this VEmpty
   */
  getCopy(): IValue {
    return new VEmpty();
  }

  /**
   * to check if this VEmpty is a number
   * 
   * @returns returns false because this VEmpty is not a number
   */
  isNumber(): boolean {
    return false;
  }

  /**
   * to check whether this VEmpty is empty
   * 
   * @returns true because this VEmpty is empty
   */
  isEmpty(): boolean {
    return true;
  }

  /**
   * to check if this VEmpty is a string
   * 
   * @returns returns false because this VEmpty is not a string
  */
  isString(): boolean {
    return false;
  }

  /**
   * to check if this VEmpty is a error
   * 
   * @returns returns false because this VEmpty is not a error
  */
  isError(): boolean {
    return false;
  }
}

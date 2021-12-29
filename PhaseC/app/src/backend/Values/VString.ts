import { IValue } from './IValue';

/**
 * To represent the Primitve type of a value for strings
 */
export class VString implements IValue {
  private value: string;

  /**
   * to construct a Primitive type String
   *
   * @param value to represent the value of this PString
   */
  constructor(value: string) {
    this.value = value;
  }

  /**
   * to get the value of this string
   *
   * @returns this string's value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * to get the value of this VString in string
   * 
   * @returns a string represening the value of this VString
   */
  valueToString(): string {
    return this.getValue();
  }

  /**
   * to set a new value for this string
   *
   * @param newValue to represent the new value for this String
   */
  setValue(newValue: string) {
    this.value = newValue;
  }

  getCopy(): IValue {
    return new VString(this.getValue());
  }

  /**
   * to compute the results of the values being added
   *
   * @param values to represent values that will be added together
   * @returns the sum of values
   */
  compute(): string {
    return this.getValue();
  }

  /**
   * to check if this VString is a number
   * 
   * @returns false because this VString is not a number
   */
  isNumber(): boolean {
    return false;
  }

  /**
   * to check if this VString is a VEmpty
   * 
   * @returns false because this VString is not empty
   */
  isEmpty(): boolean {
    return false;
  }

  /**
   * to check if this string is a string
   * 
   * @returns true because this VString is a string
   */
  isString(): boolean {
    return true;
  }

  /**
   * to check if this string is an error
   * 
   * @returns false because this VString is not an error
   */
  isError(): boolean {
    return false;
  }
}

import { IValue } from './IValue';

/**
 * To represent the Primitve type of a value for numbers
 */
export class VNum implements IValue {
  private value: number;

  /**
   * to construct a Primitive type number
   *
   * @param value to represent the value of this PNum
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * to get the value of this string
   *
   * @returns this string's value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * to convert the value of this VNum to a string
   * 
   * @returns a string represening the value of this VNum
   */
  valueToString(): string {
    return this.getValue().toString();
  }

  /**
   * to set a new value for this string
   *
   * @param newValue to represent the new value for this String
   */
  setValue(newValue: number) {
    this.value = newValue;
  }

  /**
   * to compute the results of the values being added
   *
   * @param values to represent values that will be added together
   * @returns the sum of values
   */
  compute(): string {
    return this.getValue().toString();
  }

  /**
   * to get the copy of this VNum
   * 
   * @returns a new VNum representing the copy of this VNum
   */
  getCopy(): IValue {
    return new VNum(this.getValue());
  }

  /**
   * to check if this VNum is a number
   * 
   * @returns true because this VNum is a number
   */
  isNumber(): boolean {
    return true;
  }

  /**
   * to check if this VNum is empty
   * 
   * @returns false because this VNum is not empty
   */
  isEmpty(): boolean {
    return false;
  }

  /**
   * to check if this VNum is a string
   * 
   * @returns false because this VNum is not a string
   */
  isString(): boolean {
    return false;
  }

  /**
   * to check if this VNum is an error
   * 
   * @returns false because this VNum is not an error
   */
  isError(): boolean {
    return false;
  }
}

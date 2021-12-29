/**
 * To represent all values that a Cell can have, including Primitive type inputs: string or num,
 * Range type values: Sum and Average, and formulas: plus, minus, multiply, and divide
 */
export interface IValue {

  /**
   * Gets the value of the specific IValue in string format
   *
   * @returns a string representing the results
   */
  valueToString(): string;

  /**
   * gets the copy of a Value, depending on what the value is
   * 
   * @returns an IValue represening the copy of this Value
   */
  getCopy(): IValue;

  /**
   * to deteremine the value of a Cell, depending on the class: this checks for Number
   *
   * @returns a boolean represening whether the value is a number or not
   */
  isNumber(): boolean;

  /**
   * to deteremine the value of a Cell, depending on the class: this checks for Empty
   *
   * @returns a boolean represening whether the value is empty or not
   */
  isEmpty(): boolean;

  /**
   * to deteremine the value of a Cell, depending on the class: this checks for String
   *
   * @returns a boolean represening whether the value is a string or not
  */
  isString(): boolean;

  /**
   * to deteremine the value of a Cell, depending on the class: this checks for Error
   *
   * @returns a boolean represening whether the value is an error or not
  */
  isError(): boolean;
}

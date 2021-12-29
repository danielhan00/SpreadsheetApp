import { Cell } from "../Cell/Cell";

/**
 * A Class containing helper functionality to be used repeatedly for the
 * backend and the frontend
 */
class Utils {
  /**
   * Abstracts the letter characters from a given string
   * @param str the given string
   * @returns a string of only the letters, empty string if no letters exist
   */
  static getLettersOnly(str: string): string {
    let match = str.match(/[a-zA-z]/g);

    return match != null ? match.join('') : '';
  }

  /**
   * Abstracts the digit characters from a given string
   * @param str the given string
   * @returns a string of only the digits, empty string if no letters exist
   */
  static getDigitsOnly(str: string): string {
    let match = str.match(/[0-9]/g);

    return match != null ? match.join('') : '';
  }

  /**
   * Checks if the given argument is a number (number or float types)
   * @param num any argument of type any
   * @returns true if a number or float, false if not any of them
   */
  static isNumeric(num: any) {
    return !isNaN(num);
  }

  /**
   * Converts a column given in a letter format to its index within an array
   * @param col a column letter in string type
   * @returns an index (number) that corresponds to the col
   */
  static colToIndex(col: string): number {
    col = col.toLowerCase();
    let chars = ' abcdefghijklmnopqrstuvwxyz',
      mode = chars.length - 1,
      number = 0;
    for (var i = 0; i < col.length; i++) {
      number = number * mode + chars.indexOf(col[i]);
    }
    return number - 1;
  }

  /**
   * Checks if a given input string has all balanced paranthesis
   * @param input the given string input
   * @returns true if balanced, false if not
   */

  static isBalancedParenthesis(input: string): boolean {
    let brackets = '()';
    let stack = [];

    for (let bracket of input) {
      let bracketsIndex = brackets.indexOf(bracket);

      if (bracketsIndex === -1) {
        continue;
      }

      if (bracketsIndex % 2 === 0) {
        stack.push(bracketsIndex + 1);
      } else {
        if (stack.pop() !== bracketsIndex) {
          return false;
        }
      }
    }
    return stack.length === 0;
  }

  static indexToCol(num: number): string {
    let letters = '';
    while (num >= 0) {
      letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
      num = Math.floor(num / 26) - 1;
    }
    return letters;
  }

}

export default Utils;


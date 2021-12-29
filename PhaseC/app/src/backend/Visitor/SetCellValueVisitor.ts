import { Cell } from '../Cell/Cell';
import { IVisitor } from './IVisitor';
import { VString } from '../Values/VString';
import { VEmpty } from '../Values/VEmpty';
import { VNum } from '../Values/VNum';
import { VError } from '../Values/VError';
import { arg, evaluate, number } from 'mathjs';
import { IValue } from '../Values/IValue';
import { SimpleSpreadSheet } from '../SpreadSheet/SimpleSpreadSheet';
import Utils from '../Utils/Utils';

// -- to test
// test the newly added interface methods (Cell, IValue)
// ignore spaces in math operations when looking for valid format

/**
 * to represent the object that sets the cell value visitor and implements
 * all functionalities of IVisitor
 */
export class SetCellValueVisitor implements IVisitor {
  /**
   * to visit cells and parse their input, then cell value
   *
   * @param cell to represent the Cell that will be visited
   */
  visit(cell: Cell): void {
    let input = cell.getInput();
    let noSpaces = input.replace(/\s/g, '');
    let noEquals = input.substr(1, input.length);
    let noEqualsNoSpaces = noSpaces.substr(1, noSpaces.length);
    let lowInputStrNoEquals = noEquals.toLowerCase();
    let lowInputStrNoEqualsNoSpaces = lowInputStrNoEquals.replace(/\s/g, '');

    // empty
    if (noSpaces == '') {
      cell.setValue(new VEmpty());
    } else if (noSpaces == '=') {
      cell.setValue(new VError('Nothing after = sign!'));
    }
    // just an input string -- no ops
    else if (noSpaces.charAt(0) != '=') {
      Utils.isNumeric(input)
        ? cell.setValue(new VNum(parseFloat(noSpaces)))
        : cell.setValue(new VString(input));

      // ***** anything below this point has an = sign in the beginning *****
      //
      // = with one number only eg. =500
    } else if (Utils.isNumeric(noEqualsNoSpaces)) {
      cell.setValue(new VNum(parseFloat(noEqualsNoSpaces)));

      // 2. cell refs
    } else if (this.cellRefValidInputSyntax(lowInputStrNoEqualsNoSpaces)) {
      try {
        cell.setValue(this.handleRef(lowInputStrNoEqualsNoSpaces, cell));
      } catch (err) {
        if (err instanceof Error) {
          cell.setValue(new VError(err.toString()));
        }
      }
    } else if (this.formulaValidInputSyntax(lowInputStrNoEqualsNoSpaces)) {
      try {
        cell.setValue(this.handleFormula(lowInputStrNoEqualsNoSpaces, cell));
      } catch (err) {
        if (err instanceof Error) {
          cell.setValue(new VError(err.toString()));
        }
      }
      //3. A SINGLE REF =ref()
    }
    // 4. OPERATIONS
    else {
      try {
        cell.setValue(this.handleOperation(noEquals, cell));
      } catch (err) {
        if (err instanceof Error) {
          cell.setValue(new VError(err.toString()));
        }
      }
    }
    this.updateChildrenRefCells(cell);
  }

  /**
   *
   * @param cell TODO comments
   */
  updateChildrenRefCells(cell: Cell): void {
    let sheet = SimpleSpreadSheet.getInstance();
    let refCellMap = sheet.getReferencedCells();
    let cellChildren = refCellMap.get(cell);
    if (cellChildren != undefined) {
      cellChildren.forEach((child) => child.accept(this));
    }
  }

  /**
   * Handles a ref() case
   * @param input
   */
  handleRef(input: string, cell: Cell): IValue {
    this.removeCellRef(cell);

    let cellRef = input.substring(4, input.length - 1);
    try {
      return this.getCellRefValue(cellRef, cell);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Handles operations
   * @param input
   */
  handleOperation(input: string, cell: Cell): IValue {
    this.removeCellRef(cell);

    let inputNoSpaces = input.replace(/\s/g, '');

    //check for balanced parens
    if (
      (inputNoSpaces.includes('(') || inputNoSpaces.includes(')')) &&
      !Utils.isBalancedParenthesis(inputNoSpaces)
    ) {
      throw Error(
        'Invalid syntax for math operations; parentheses must be balanced.'
      );
    }

    // evaluate ref add formulas
    let onlyRefsAddNoParensFormat =
      /^((ref\((([a-zA-Z])+(\d+))\))+[+])+(ref\((([a-zA-Z])+(\d+))\))$/;

    let refAddNoParensNoSpaces = inputNoSpaces
      .replace(/(?<![a-zA-z]+)(\()/g, '')
      .replace(/(?<!([a-zA-Z])+(\d+))(\))/g, '');

    if (onlyRefsAddNoParensFormat.test(refAddNoParensNoSpaces)) {
      let args = inputNoSpaces.match(/ref\((([a-zA-Z])+(\d+))\)/g);
      let argRefValues = args!.map((arg) => {
        try {
          return this.getCellRefValue(arg.substring(4, arg.length - 1), cell);
        } catch (err) {
          throw err;
        }
      });
      //string and empties only
      if (argRefValues.every((val) => val.isString() || val.isEmpty())) {
        //check that the strings don't have order-of-op parens
        let inputWithoutRefs = input.replace(/ref\((([a-zA-Z])+(\d+))\)/g, '');
        if (inputWithoutRefs.includes('(') || inputWithoutRefs.includes(')')) {
          throw Error(
            'Operation parenthesis not permitted for string concatenation'
          );
        }

        return this.handleStringOp(input, cell);
      }
      //number and empties only
      else {
        return this.handleMathOp(inputNoSpaces, cell);
      }
    }

    let stringConcatFormat =
      /^((("(?:[^"\\]|\\.)*")|(ref\((([a-zA-Z])+(\d+))\)))+[+])+(("(?:[^"\\]|\\.)*")|(ref\((([a-zA-Z])+(\d+))\)))$/; // "..."+"...."+ ref(C1) + "..."
    let stringConcatInvalidArgNum =
      /^((("(?:[^"\\]|\\.)*")|(ref\((([a-zA-Z])+(\d+))\)))+[+])+$/; // "..."+"..."+

    if (stringConcatFormat.test(inputNoSpaces)) {
      return this.handleStringOp(input, cell);
    } else if (stringConcatInvalidArgNum.test(inputNoSpaces)) {
      throw Error('Invalid number of arguments');
      //just a string with no concat
    } else if (
      inputNoSpaces.substr(0, 1) == '"' &&
      inputNoSpaces.substr(inputNoSpaces.length - 1, inputNoSpaces.length) ==
        '"'
    ) {
      let stringOnlyInput = inputNoSpaces.substr(1, inputNoSpaces.length - 2);

      let unescapedQuotes = /(?<!\\)"/g;
      if (unescapedQuotes.test(stringOnlyInput)) {
        throw Error(
          'Invalid format for strings with = operator, nested quotations must be escaped with double backslashes.'
        );
      }
      stringOnlyInput = stringOnlyInput.replace(/\\"/g, '"');
      return new VString(stringOnlyInput);
    }

    //evalute input validity w/o parens (just for regex check) -- we only allow parens for refs and formulas
    let noParensNoSpaces = inputNoSpaces.replace(/(?<![a-zA-z]+)(\()/g, '');
    noParensNoSpaces = noParensNoSpaces.replace(
      /(?<!([a-zA-Z])+(\d+))(\))/g,
      ''
    );

    // formats -- do not account for parens because we checked them previously
    let mathOpFormatNoParens =
      /^((([-+]?[0-9]*\.?[0-9]+)|(ref\((([a-zA-Z])+(\d+))\))|(([a-zA-Z])+\(((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))\)))+[\/\+\-\*])+((([-+]?[0-9]*\.?[0-9]+)|(ref\((([a-zA-Z])+(\d+))\)))|(([a-zA-Z])+\(((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))\)))$/; //5+454.3-54543/5454-ref(C1)
    let mathOpInvalidArgNumNoParens =
      /^((([-+]?[0-9]*\.?[0-9]+)|(ref\((([a-zA-Z])+(\d+))\))|(([a-zA-Z])+\(((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))\)))+[\/\+\-\*])+$/; //5+8-
    let mathOpInvalidArgTypeNoParens = /^((.*?)+[\/\+\-\*])+((.*?)+)$/; //54&!!0 + 544??65 - "hi"

    if (mathOpFormatNoParens.test(noParensNoSpaces)) {
      return this.handleMathOp(inputNoSpaces, cell);
    } else if (mathOpInvalidArgNumNoParens.test(noParensNoSpaces)) {
      throw Error('Invalid number of arguments');
    } else if (mathOpInvalidArgTypeNoParens.test(noParensNoSpaces)) {
      throw Error(
        'Invalid argument types, accepts integers and floats for math operations'
      );
    }

    throw Error('No valid operation found after the = sign!');
  }

  /**
   * Handles string operations with the plus sign
   * @param input
   * @param cell
   * @returns the new String IValue
   */
  handleStringOp(input: string, cell: Cell): IValue {
    // get list of args

    let args;

    if (input.includes('"')) {
      args = input
        .split('"') //split by removing quotes
        .filter((arg) => arg.replace(/\s/g, '') !== '+') // remove any single "+"
        .map((arg) => {
          return arg.replace(/\\/g, '"');
        });
    } else {
      args = input.split('+');
    }

    // get refs in correct format
    args = args.map((arg) => {
      // remove any leftover +'s before or after a ref arg
      let uncleanedRefFormat = /^[+]*(ref\((([a-zA-Z])+(\d+))\))[+]*$/;

      let argNoSpaces = arg.replace(/\s/g, '');
      let cleanedRef = argNoSpaces.replace(/^[+]|[+]$/g, '');

      return uncleanedRefFormat.test(argNoSpaces) ? cleanedRef : arg;
    });

    //replace cell refs with real values
    args = args.map((arg) => {
      if (this.cellRefValidInputSyntax(arg)) {
        try {
          let cellRefValue = this.getCellRefValue(
            arg.substring(3, arg.length - 1),
            cell
          );

          //if a ref is empty, return ''
          if (cellRefValue.isEmpty()) {
            return '';
          }

          //if ref is a number
          else if (cellRefValue.isNumber()) {
            throw Error(
              'Can not concatenate; issue found in cell reference(s): expected strings as arguments.'
            );
          } else {
            return cellRefValue.valueToString();
          }
          //if err
        } catch (err) {
          throw err;
        }
      }
      return arg;
    });

    return new VString(args.join(''));
  }

  /**
   * Handles math operations
   * @param input
   * @param cell
   * @returns nothing <3
   */
  handleMathOp(input: string, cell: Cell) {
    // find all the refs and replace them
    let inputAfterRefs = input.replace(
      /ref\((([a-zA-Z])+(\d+))\)/g,
      (match, startIndex, wholeString) => {
        let refOnly = match.substring(3, match.length - 1);

        try {
          let cellRefValue = this.getCellRefValue(refOnly, cell);
          let refValue = cellRefValue.valueToString();

          //if empty
          if (cellRefValue.isEmpty()) {
            refValue = '0';
          }

          //if string
          if (cellRefValue.isString()) {
            throw Error(
              'Can not compute; issue found in cell reference(s): expected integers or floats as arguments.'
            );
          }

          return refValue;
          //if error
        } catch (err) {
          throw err;
        }
      }
    );

    //find the formulas
    inputAfterRefs = inputAfterRefs.replace(
      /([a-zA-Z])+\(((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))\)/g,
      (match, startIndex, wholeString) => {
        let formula = match;

        // this tryCatch is being caught in tests
        try {
          let formulaResult = '0';

          if (this.formulaValidInputSyntax(formula)) {
            formulaResult = this.handleFormula(formula, cell).valueToString();
          }
          return formulaResult;
        } catch (err) {
          throw err;
        }
      }
    );
    //compute
    let result;

    // mathjs syntax error
    result = evaluate(inputAfterRefs);

    // mathjs div by 0 error
    if (result == 'Infinity') {
      throw Error('Cannot divide by 0');
    }

    return new VNum(result);
  }

  /**
   * Handles and updates a cell in the case of formulas
   * @param String
   * @returns an IValue for the formula result
   */
  handleFormula(input: string, cell: Cell): IValue {
    let sheet = SimpleSpreadSheet.getInstance();
    this.removeCellRef(cell);

    let cellArray = sheet.getCellArray();

    //ivalue
    let formula = input.substr(0, 3).toLowerCase(); //avg OR sum
    let range = input.replace(formula + '(', '').replace(')', '');
    let rangeFormat = /^((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))$/;

    if (rangeFormat.test(range)) {
      let rangeArgs = range.substr(0, range.length).split(':');
      let start = rangeArgs[0]; //A1
      let end = rangeArgs[1]; //C3

      //start = A1
      //end = C3

      let startLetters = Utils.getLettersOnly(start);
      let startNumbers = Utils.getDigitsOnly(start);
      let endLetters = Utils.getLettersOnly(end);
      let endNumbers = Utils.getDigitsOnly(end);

      let startRow = parseInt(startNumbers) - 1;
      let startCol = Utils.colToIndex(startLetters);
      let endRow = parseInt(endNumbers) - 1;
      let endCol = Utils.colToIndex(endLetters);

      // check if range is reversed, and put them in order
      // find logic for three other orders
      if (startRow > endRow) {
        let tempEndRow = startRow;
        startRow = endRow;
        endRow = tempEndRow;
      }

      if (startCol > endCol) {
        let tempEndCol = startCol;
        startCol = endCol;
        endCol = tempEndCol;
      }

      try {
        cellArray[startRow][startCol];
        cellArray[endRow][endCol];
      } catch {
        throw Error('Invalid range, out of bound.');
      }

      let args: IValue[] = [];

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          let cellCol = Utils.indexToCol(col);
          let cellRow = row + 1;
          let cellRef = cellCol + cellRow;

          args = args.concat(this.getCellRefValue(cellRef, cell));
        }
      }

      // check if they are all numbers or empties -- filter out the ones that aren't
      let invalidValueTypes = args.filter((value) => {
        return !(value.isNumber() || value.isEmpty());
      });

      if (invalidValueTypes.length > 0) {
        throw Error('Invalid argument type, only numbers and integers');
      }
      // if all empty should be 0
      // remove empties or non-numbers
      let noEmptyArgs: IValue[] = args.filter((value) => {
        return value.isNumber() && !value.isEmpty();
      });

      if (noEmptyArgs.length == 0) {
        return new VNum(0);
      }

      // parse the args
      let parsedArgs: number[] = noEmptyArgs.map((value) => {
        return parseFloat(value.valueToString());
      });

      let sum = parsedArgs.reduce((a, b) => a + b);

      if (formula == 'sum') {
        return new VNum(sum);
      } else if (formula == 'avg') {
        let result = sum / parsedArgs.length;
        return new VNum(result);
      } else {
        throw Error('Invalid formula, does not exist.');
      }
    } else {
      throw Error('Invalid arugment, expected syntax A1:C3');
    }
  }

  /**
   * Does the given formula input uses valid syntax? ref(.....)
   * @returns boolean, true if cell ref format is valid
   */
  formulaValidInputSyntax(formulaSyntax: string): boolean {
    return /^([a-zA-Z])+\(((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))\)$/.test(
      formulaSyntax
    );
  }

  /**
   * Does the given cellRef input use valid syntax? ref(.....)
   * @returns boolean, true if cell ref format is valid
   */
  cellRefValidInputSyntax(refSyntax: string): boolean {
    return /^ref\((([a-zA-Z])+(\d+))\)$/.test(refSyntax);
  }

  /**
   * Removes cell ref from the map
   * @param currCell
   */
  removeCellRef(currCell: Cell): void {
    let sheet = SimpleSpreadSheet.getInstance();
    let refCellMap = sheet.getReferencedCells();

    refCellMap.forEach((value, key) => {
      if (value.includes(currCell)) {
        if (value.length == 1) {
          refCellMap.delete(key);
        } else {
          let newValue = value.filter((v) => v != currCell);
          refCellMap.set(key, newValue);
        }
      }
    });
  }

  /**
   * Checks if a given cellRef exists in the spreadsheet
   * @param cellRef
   * @returns IValue
   */
  getCellRefValue(cellRef: string, currCell: Cell): IValue {
    let sheet = SimpleSpreadSheet.getInstance();

    let cellArray = sheet.getCellArray();
    let refCellMap = sheet.getReferencedCells();

    let letters = Utils.getLettersOnly(cellRef);
    let numbers = Utils.getDigitsOnly(cellRef);

    let rowNum = parseInt(numbers) - 1;
    let colNum = Utils.colToIndex(letters);
    let referencedCell;

    try {
      referencedCell = cellArray[rowNum][colNum];
    } catch {
      throw Error(
        'Invalid ref given to ref(); ' + cellRef + ' cell does not exist.'
      );
    }

    // Self-referencing
    if (referencedCell == currCell) {
      throw Error('Cannot self reference a cell');
    }

    let currCellChildren = refCellMap.get(currCell);
    try {
      this.checkForCycles(currCell, referencedCell);
    } catch (err) {
      throw err;
    }

    //add to map
    //if its not already in the map

    let refCellChildren = refCellMap.get(referencedCell);

    if (refCellChildren != undefined) {
      if (!refCellChildren.includes(currCell)) {
        refCellChildren.push(currCell);
      }
    } else {
      let newChildrenArray = [currCell];
      refCellMap.set(referencedCell, newChildrenArray);
    }

    if (referencedCell.getValue().isError()) {
      throw Error('Can not compute; error found in cell reference(s).');
    }

    return referencedCell.getValue().getCopy();
  }

  /**
   * Checks for cycles in references
   * @param currCell
   * @param refCell
   * @returns true if there is cycle
   */
  checkForCycles(currCell: Cell, refCell: Cell): boolean {
    let sheet = SimpleSpreadSheet.getInstance();

    let key = currCell;
    let children = sheet.getReferencedCells().get(key);

    if (children != undefined) {
      children.forEach((child) => {
        if (child == refCell) {
          throw Error('Cycle Found');
        } else {
          this.checkForCycles(child, refCell);
        }
      });
    }
    return false;
  }
}

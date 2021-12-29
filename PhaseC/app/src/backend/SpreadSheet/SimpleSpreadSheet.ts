import { Cell } from '../Cell/Cell';
import { SetCellValueVisitor } from '../Visitor/SetCellValueVisitor';
//@ts-ignore
import { convertCSVToArray } from 'convert-csv-to-array';
import Utils from '../Utils/Utils';
import { VError } from '../Values/VError';
import { ctransposeDependencies, e, forEach } from 'mathjs';

/**
 * To represent a simple spread sheet which allows the functionalities of initializing and updating the sheet.
 */
export class SimpleSpreadSheet {
  private static instance: SimpleSpreadSheet;
  private title: string = '';
  private cellArray: Cell[][] = [[]];
  private referencedCells: Map<Cell, Cell[]> = new Map(); //this should also include cells with formulas (avg and sum)
  private rowSize: number = 50;
  private colSize: number = 26;
  private limit: number = 1000;

  /**
   * to construct an empty spreadsheet with no title or cells
   */
  private constructor() {}

  /**
   * to get an instance of this SimpleSpreadsheet
   *
   * @returns an instance of this Simple Spreadsheet
   */
  static getInstance(): SimpleSpreadSheet {
    if (this.instance == null) {
      this.instance = new SimpleSpreadSheet();
    }
    return this.instance;
  }

  /**
   * to set the instance of this spreadsheet -- only used for testing
   *
   * @param newInstance to represent the new instance of this spreadsheet
   */
  static setInstace(newInstance: SimpleSpreadSheet): void {
    this.instance = newInstance;
  }

  /**
   * to update the sheet with cells and inputs
   *
   * @param cellRow to represent the new cell's row number
   * @param cellCol to repreent the new cell's column number
   * @param cellInput to represent the new cell's input
   *
   * @throws an error if the cell does not exist on this spreadsheet
   */
  public updateSheet(
    cellRow: number,
    cellCol: number,
    cellInput: string
  ): void {
    let sheet = SimpleSpreadSheet.getInstance();

    let cell;

    try {
      cell = sheet.getCellArray()[cellRow][cellCol];
    } catch {
      throw new Error('Cell does not exist.');
    }

    cell.setInput(cellInput);
    cell.accept(new SetCellValueVisitor());
  }

  /**
   * initializes a 2D array of Cells that will represent the cells of this SimpleSpreadSheet
   */
  public initializeCellArray(): void {
    let sheet = SimpleSpreadSheet.getInstance();

    let initalArray: Cell[][] = [[]];

    for (let row = 0; row < this.rowSize; row++) {
      initalArray[row] = [];
      for (let col = 0; col < this.colSize; col++) {
        initalArray[row][col] = new Cell();
      }
    }

    sheet.setCellArray(initalArray);
  }

  /**
   * to get the title for this spreadsheet
   *
   * @returns the title for this simple spread sheet
   */
  public getTitle(): string {
    return this.title;
  }

  /**
   * to set a new title name for this spreadsheet
   *
   * @param newTitle to represent the new title for this simple spreadsheet
   */
  public setTitle(newTitle: string): void {
    this.title = newTitle;
  }

  /**
   * To get the all the cells on this Simple Spreadsheet
   *
   * @returns this spreadsheet's array of cells
   */
  public getCellArray(): Cell[][] {
    return this.cellArray;
  }

  /**
   * to set a new value to the cellArray of this spreadsheet
   *
   * @param newCellArray to represent the new value for the cellArray of this sheet
   */
  public setCellArray(newCellArray: Cell[][]): void {
    this.cellArray = newCellArray;
  }

  /**
   * Get the column size of the spereadsheet
   *
   * @returns this spreadsheet's column size
   */
  public getColSize(): number {
    return this.colSize;
  }

  /**
   * to set a new value to the column size of this spreadsheet
   *
   * @param size to represent the new value for the colSize of this sheet
   */
  public setColSize(size: number): void {
    this.colSize = size;
  }

  /**
   * Get the column size of the spereadsheet
   *
   * @returns this spreadsheet's column size
   */
  public getRowSize(): number {
    return this.rowSize;
  }

  /**
   * to set a new value to the row size of this spreadsheet
   *
   * @param size to represent the new value for the rowSize of this sheet
   */
  public setRowSize(size: number): void {
    this.rowSize = size;
  }

  /**
   * Get the limit value of the spereadsheet
   *
   * @returns this spreadsheet's limit for columns & rows
   */
  public getLimit(): number {
    return this.limit;
  }

  /**
   * to delete the row given its row number
   *
   * @param row to represent the row being deleted
   *
   * @throws an error if the row is not on this spreadsheet
   */
  public deleteRow(row: number) {
    let sheet = SimpleSpreadSheet.getInstance();

    if (row > sheet.getRowSize() || row < 0) {
      throw new Error('Entered row is out of bounds');
    }

    // BEFORE DELETE ROW
    let oldParentRefs = new Map();

    let parentCells = Array.from(sheet.getReferencedCells().keys());

    parentCells.forEach((cell) => {
      let key = cell;

      for (let rowInd = 0; rowInd < sheet.getCellArray().length - 1; rowInd++) {
        let colInd = sheet.getCellArray()[rowInd].indexOf(key);
        if (colInd != -1) {
          let oldRef = Utils.indexToCol(colInd) + (rowInd + 1);
          oldParentRefs.set(oldRef.toLowerCase(), key);
        }
      }
    });

    // DELETE ROW

    sheet.getCellArray().splice(row, 1);
    let tempRow = [];

    for (let col = 0; col < this.colSize; col++) {
      tempRow.push(new Cell());
    }

    sheet.getCellArray().push(tempRow);

    // AFTER DELETE ROW

    let allChildren: Cell[] = []; // loop over all MAIN map values and append them to this
    parentCells.forEach((parent) => {
      let children = sheet.getReferencedCells().get(parent);
      children!.forEach((child: Cell) => {
        if (!allChildren.includes(child)) {
          allChildren.push(child);
        }
      });
    });
    // [=, ref(, A1, ), ]
    //now we update the inputs
    let errorDetected = false;
    allChildren.forEach((child) => {
      let arrayArgs = this.arrayHelper(child.getInput().replace(/\s/g, '')); //THE LOOP WE JUST CODED
      let newArrayArgs: any[] = [];
      newArrayArgs = arrayArgs.map((arg: string) => {
        //is this a cell
        if (/^(([a-zA-Z])+(\d+))/.test(arg)) {
          if (oldParentRefs.has(arg.toLowerCase())) {
            let parentCell = oldParentRefs.get(arg.toLowerCase());
            let newParentRef: string = '';

            for (
              let rowInd = 0;
              rowInd < sheet.getCellArray().length;
              rowInd++
            ) {
              let colInd = sheet.getCellArray()[rowInd].indexOf(parentCell);
              if (parseInt(Utils.getDigitsOnly(arg)) == row + 1) {
                errorDetected = true;
                break;
              }
              if (colInd != -1) {
                newParentRef = Utils.indexToCol(colInd) + (rowInd + 1);
              }
            }

            return newParentRef;
          }
        } else {
          //if not a ref
          return arg;
        }
      });

      //now we set the input
      if (!errorDetected) {
        let newInput = newArrayArgs.join('');
        child.setInput(newInput);
        child.accept(new SetCellValueVisitor());
      } else {
        let errMsg = 'Reference deleted, does not exist';
        child.setInput(errMsg);
        child.setValue(new VError(errMsg));
      }
    });
  }

  /**
   * to delete the column given its column number
   *
   * @param col to represent the col being deleted
   *
   * @throws error if the number of columns exceed the limit of columns this spreadsheet can have
   */
  public deleteCol(col: number) {
    let sheet = SimpleSpreadSheet.getInstance();

    if (col > sheet.getColSize() || col < 0) {
      throw new Error('Entered col is out of bounds');
    }

    // BEFORE DELETE COL
    let oldParentRefs = new Map();

    let parentCells = Array.from(sheet.getReferencedCells().keys());

    parentCells.forEach((cell) => {
      let key = cell;

      for (let rowInd = 0; rowInd < sheet.getCellArray().length - 1; rowInd++) {
        let colInd = sheet.getCellArray()[rowInd].indexOf(key);
        if (colInd != -1) {
          let oldRef = Utils.indexToCol(colInd) + (rowInd + 1);
          oldParentRefs.set(oldRef.toLowerCase(), key);
        }
      }
    });

    // DELETE COL
    for (let row = 0; row < this.rowSize; row++) {
      sheet.getCellArray()[row].splice(col, 1);
      sheet.getCellArray()[row].push(new Cell());
    }

    // AFTER DELETE COL

    let allChildren: Cell[] = []; // loop over all MAIN map values and append them to this
    parentCells.forEach((parent) => {
      let children = sheet.getReferencedCells().get(parent);
      children!.forEach((child: Cell) => {
        if (!allChildren.includes(child)) {
          allChildren.push(child);
        }
      });
    });
    // [=, ref(, A1, ), ]
    //now we update the inputs
    let errorDetected = false;
    allChildren.forEach((child) => {
      let arrayArgs = this.arrayHelper(child.getInput().replace(/\s/g, '')); //THE LOOP WE JUST CODED
      let newArrayArgs: any[] = [];
      newArrayArgs = arrayArgs.map((arg: string) => {
        //is this a cell
        if (/^(([a-zA-Z])+(\d+))/.test(arg)) {
          if (oldParentRefs.has(arg.toLowerCase())) {
            let parentCell = oldParentRefs.get(arg.toLowerCase());
            let newParentRef: string = '';

            for (
              let rowInd = 0;
              rowInd < sheet.getCellArray().length;
              rowInd++
            ) {
              let colInd = sheet.getCellArray()[rowInd].indexOf(parentCell);
              if (Utils.colToIndex(Utils.getLettersOnly(arg)) == col) {
                errorDetected = true;
                break;
              }
              if (colInd != -1) {
                newParentRef = Utils.indexToCol(colInd) + (rowInd + 1);
              }
            }

            return newParentRef;
          }
        } else {
          //if not a ref
          return arg;
        }
      });

      //now we set the input
      if (!errorDetected) {
        let newInput = newArrayArgs.join('');
        child.setInput(newInput);
        child.accept(new SetCellValueVisitor());
      } else {
        let errMsg = 'Reference deleted, does not exist';
        child.setInput(errMsg);
        child.setValue(new VError(errMsg));
      }
    });
  }

  /**
   * to add a new row given its row number
   *
   * @param row to represent the row number being added
   *
   * @throws error if the number of rows exceed the limit of rows this spreadsheet can have
   */
  public addRow(row: number): void {
    let tempRow = [];

    let sheet = SimpleSpreadSheet.getInstance();

    if (sheet.getRowSize() < sheet.getLimit()) {
      for (let col = 0; col < this.colSize; col++) {
        tempRow.push(new Cell());
      }
    } else {
      throw new Error('Exceeded spreadsheet row limit');
    }

    let oldParentRefs = new Map();

    let parentCells = Array.from(sheet.getReferencedCells().keys());

    parentCells.forEach((cell) => {
      let key = cell;

      for (let rowInd = 0; rowInd < sheet.getCellArray().length - 1; rowInd++) {
        let colInd = sheet.getCellArray()[rowInd].indexOf(key);
        if (colInd != -1) {
          let oldRef = Utils.indexToCol(colInd) + (rowInd + 1);
          oldParentRefs.set(oldRef.toLowerCase(), key);
        }
      }
    });

    //NOW update the spreadsheet (add, row, delete, etc.)
    sheet.getCellArray().splice(row, 0, tempRow);
    this.setRowSize(this.getRowSize() + 1);

    let allChildren: Cell[] = []; // loop over all MAIN map values and append them to this
    parentCells.forEach((parent) => {
      let children = sheet.getReferencedCells().get(parent);

      children!.forEach((child: Cell) => {
        if (!allChildren.includes(child)) {
          allChildren.push(child);
        }
      });
    });
    // [=, ref(, A1, ), ]
    //now we update the inputs
    allChildren.forEach((child) => {
      let arrayArgs = this.arrayHelper(child.getInput().replace(/\s/g, '')); //THE LOOP WE JUST CODED
      let newArrayArgs: any[] = [];

      newArrayArgs = arrayArgs.map((arg: string) => {
        //is this a cell
        if (/^(([a-zA-Z])+(\d+))/.test(arg)) {
          let parentCell = oldParentRefs.get(arg.toLowerCase());
          let newParentRef: string = '';

          for (let rowInd = 0; rowInd < sheet.getCellArray().length; rowInd++) {
            let colInd = sheet.getCellArray()[rowInd].indexOf(parentCell);
            if (colInd != -1) {
              newParentRef = Utils.indexToCol(colInd) + (rowInd + 1);
            }
          }
          return newParentRef;
        } else {
          //if not a ref
          return arg;
        }
      });

      //now we set the input
      let newInput = newArrayArgs.join('');
      child.setInput(newInput);
    });
  }

  /**
   * to add a new column given its column number
   *
   * @param col to represent the column number being added
   *
   * @throws an error if the column doesn't exisit on the spreadsheet
   */
  public addCol(col: number) {
    let sheet = SimpleSpreadSheet.getInstance();

    if (sheet.getColSize() >= sheet.getLimit()) {
      throw Error('Exceeded spreadsheet column limit');
    }

    // BEFORE ADDING COLUMNS
    let oldParentRefs = new Map();

    let parentCells = Array.from(sheet.getReferencedCells().keys());

    parentCells.forEach((cell) => {
      let key = cell;

      for (let rowInd = 0; rowInd < sheet.getCellArray().length - 1; rowInd++) {
        let colInd = sheet.getCellArray()[rowInd].indexOf(key);
        if (colInd != -1) {
          let oldRef = Utils.indexToCol(colInd) + (rowInd + 1);
          oldParentRefs.set(oldRef.toLowerCase(), key);
        }
      }
    });

    // ADDING COLUMNS
    for (let row = 0; row < this.rowSize; row++) {
      sheet.getCellArray()[row].splice(col, 0, new Cell());
    }
    this.setColSize(this.getColSize() + 1);

    // AFTER ADDING COLUMNS

    let allChildren: Cell[] = []; // loop over all MAIN map values and append them to this
    parentCells.forEach((parent) => {
      let children = sheet.getReferencedCells().get(parent);
      children!.forEach((child: Cell) => {
        if (!allChildren.includes(child)) {
          allChildren.push(child);
        }
      });
    });

    // fine till here
    allChildren.forEach((child) => {
      let arrayArgs = this.arrayHelper(child.getInput().replace(/\s/g, '')); //THE LOOP WE JUST CODED
      let newArrayArgs: any[] = [];

      newArrayArgs = arrayArgs.map((arg: string) => {
        //is this a cell
        if (/^(([a-zA-Z])+(\d+))/.test(arg)) {
          let parentCell = oldParentRefs.get(arg.toLowerCase());
          let newParentRef: string = '';

          for (let rowInd = 0; rowInd < sheet.getCellArray().length; rowInd++) {
            let colInd = sheet.getCellArray()[rowInd].indexOf(parentCell);
            if (colInd != -1) {
              newParentRef = Utils.indexToCol(colInd) + (rowInd + 1);
            }
          }

          return newParentRef;
        } else {
          //if not a ref
          return arg;
        }
      });

      //now we set the input
      let newInput = newArrayArgs.join('');
      child.setInput(newInput);
    });
  }

  /**
   * clears a row from this SimpleSpreadSheet
   *
   * @param row to represent the row that will be cleared
   *
   * @throws an error if the row doesn't exist on the spreadsheet
   */
  public clearRow(row: number) {
    let sheet = SimpleSpreadSheet.getInstance();

    if (row <= sheet.getRowSize() && row >= 0) {
      sheet.getCellArray()[row].forEach((cell) => {
        cell.clearCell();
      });
    } else {
      throw Error("Row doesn't exist on spreadsheet");
    }
  }

  /**
   * clears a column from this SimpleSpreadSheet
   *
   * @param col to represent the column that will be cleared
   */
  public clearCol(col: number) {
    let sheet = SimpleSpreadSheet.getInstance();

    if (col <= sheet.getColSize() && col >= 0) {
      for (let row = 0; row < this.rowSize; row++) {
        let cell = sheet.getCellArray()[row][col];
        cell.clearCell();
      }
    } else {
      throw Error("Column doesn't exist on spreadsheet");
    }
  }

  /**
   * to set referenced celles
   *
   * @param refCells to represent map  of cell and their referenced cells
   * @returns a map of cells with their references
   */
  public setReferencedCells(refCells: Map<Cell, Cell[]>): void {
    this.referencedCells = refCells;
  }

  /**
   * to get referenced cells
   *
   * @returns a map of cells with their references
   */
  public getReferencedCells(): Map<Cell, Cell[]> {
    return this.referencedCells;
  }

  /**
   * Initializes and populates the cells of this Spreadsheet
   * with the given csv string (import functionality)
   *
   * @param csvString to represent the given string to be converted into
   *                  different values of cells in this Spreadsheet
   */
  public initializeFromCsvString(csvString: string): void {
    let sheet = SimpleSpreadSheet.getInstance();

    //first, wipe current array
    sheet.initializeCellArray();

    // if there aren't any commas -> only 1 element -> just return the given string
    if (!csvString.includes(',')) {
      const cell: Cell = sheet.getCellArray()[0][0];
      cell.setInput(csvString);
      cell.accept(new SetCellValueVisitor());
    } else {
      let inputs: any[][];
      sheet.cantExceedLimit(inputs = convertCSVToArray(csvString, {
        type: 'array',
        separator: ',',
      }));

      // sets the correct number of rows and columns if the
      // number of rows/columns exceed the default numbers of
      // rows and columns of this Spreadsheet
      sheet.setBiggerSize(inputs);

      let rowsNum: number = inputs.length;

      for (let rowIn = 0; rowIn < rowsNum; rowIn++) {
        for (let colIn = 0; colIn < inputs[rowIn].length; colIn++) {

          const cell: Cell = sheet.getCellArray()[rowIn][colIn];
          cell.setInput(inputs[rowIn][colIn]);
          cell.accept(new SetCellValueVisitor());
        }
      }
    }
  }

  /**
   * helper function for import, ensures the user doesn't import a file that
   * exceeds our spreadsheet limit.
   * 
   * @param inputs to represent the input array that will be given to the library
   *               to convert csv to array
   */
  public cantExceedLimit(inputs: any[][]): void {

    let sheet = SimpleSpreadSheet.getInstance();
    let rowsNum: number = inputs.length;
    for (let rowIn = 0; rowIn < rowsNum; rowIn++) {
      for (let colIn = 0; colIn < inputs[rowIn].length; colIn++) {
        
        if (rowsNum > sheet.getLimit() || inputs[rowIn].length > sheet.getLimit()) {
          throw new Error("Ooopsie! Your Spreadsheet is exceeding our limit! You can't have more than 1000 rows or columns.")
        }
      }
    }
  }

    
  /**
   * check to see if the number of rows/columns are more than the
   * default number of rows/columns of this Spreadsheet
   * in that case, we would increase the number of rows/columns
   *
   * @param arrs to represent the 2D array of cells of this Spreadsheet
   */
  public setBiggerSize(arrs: Cell[][]): void {
    let sheet = SimpleSpreadSheet.getInstance();
    let rowsNum: number = arrs.length;

    for (let rowIn = 0; rowIn < rowsNum; rowIn++) {
      let colsNum: number = arrs[rowIn].length;

      for (let colIn = 0; colIn < colsNum; colIn++) {
        // the number of rows should not exceed the limit
        if (rowsNum > sheet.getRowSize() && rowsNum < sheet.getLimit()) {
          sheet.setRowSize(rowsNum);
        }
        // the number of columns should not exceed the limit
        if (colsNum > sheet.getColSize() && colsNum < sheet.getLimit()) {
          sheet.setColSize(colsNum);
        }
      }
    }
  }

  /**
   *
   * creates a string that represents the spreadsheet cells that will be exported
   *
   * @returns a string representing a csv file to be exported
   */
  public toCsvString(): string {
    let csv: string = '';
    let sheet = SimpleSpreadSheet.getInstance();
    let arr: Cell[][] = sheet.getCellArray();
    let isSheetEmptyCheck: boolean = false;
    for (let row: number = arr.length - 1; row >= 0; row--) {
      let isEmptyCheck: boolean = false;
      let str: string = '';
      for (let col: number = arr[row].length - 1; col >= 0; col--) {
        if (arr[row][col].getInput() != '') {
          isEmptyCheck = true;
        }

        if (isEmptyCheck) {
          if (arr[row][col].getInput() != '') {
            str = arr[row][col].getInput() + ',' + str;
          }
          // makes sure there are commas printed out for empty cells
          // in a row where there is at least one unempty cell
          else {
            str = ',' + str;
          }
        }
      }

      if (str != '') {
        isSheetEmptyCheck = true;
      }

      if (isSheetEmptyCheck) {
        str = str.slice(0, -1);
        str += '\n';
        csv = str + csv;
      }
    }

    csv = csv.slice(0, -1);
    return csv + '\n';
  }

  /**
   * Clears a cell at a specific location in the spreadsheet.
   * @param rowNum
   * @param rowCol
   */
  public clearCellinSheet(rowNum: number, rowCol: number) {
    let sheet = SimpleSpreadSheet.getInstance();

    let cellToClear = sheet.getCellArray()[rowNum][rowCol];
    cellToClear.clearCell();
    cellToClear.accept(new SetCellValueVisitor());
  }

  /**
   *
   */
  public arrayHelper(input: string): string[] {
    let inputSoFar = input.replace(/\s/g, '');
    let inputArr = [];

    let arrItem = '';
    let counter = input.length;

    while (counter > -1) {
      //refs
      if (/^(ref\((([a-zA-Z])+(\d+))\))/.test(inputSoFar)) {
        //lets push what we have so far
        inputArr.push(arrItem);

        let ref = inputSoFar.match(/^(ref\((([a-zA-Z])+(\d+))\))/)![0];
        let firstHalf = ref.substring(0, 4);
        let exactRef = ref.substring(4, ref.length - 1).toLowerCase(); //A1
        let lastHalf = ref.substring(ref.length - 1);

        inputArr.push(firstHalf);
        inputArr.push(exactRef);
        inputArr.push(lastHalf);

        inputSoFar = inputSoFar.substring(ref.length, inputSoFar.length);
        counter = counter - ref.length;
        //at the end, reset
        arrItem = '';
      } else if (
        /^([a-zA-Z])+\(((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))\)/.test(
          inputSoFar
        )
      ) {
        //lets push what we have so far
        inputArr.push(arrItem);

        let ref = inputSoFar.match(
          /^([a-zA-Z])+\(((([a-zA-Z])+(\d+)):(([a-zA-Z])+(\d+)))\)/
        )![0];

        let firstHalf = ref.substring(0, 4);
        let lastHalf = ref.substring(ref.length - 1);

        let rangeOnly = ref.substring(4, ref.length - 1);
        let refSplitByColon = rangeOnly.split(':');

        let firstExactRef = refSplitByColon[0];
        let colon = ':';
        let secondExactRef = refSplitByColon[1];

        inputArr.push(firstHalf);
        inputArr.push(firstExactRef);
        inputArr.push(colon);
        inputArr.push(secondExactRef);
        inputArr.push(lastHalf);

        inputSoFar = inputSoFar.substring(ref.length, inputSoFar.length);
        counter = counter - ref.length;

        //at the end, reset
        arrItem = '';
      } else {
        arrItem = arrItem + inputSoFar.charAt(0);
        inputSoFar = inputSoFar.substring(1, inputSoFar.length);
        counter = counter - 1;
      }
    }

    inputArr.push(arrItem);
    return inputArr;
  }
}

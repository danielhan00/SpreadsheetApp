import { Cell } from '../backend/Cell/Cell';
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';
//@ts-ignore
import { convertCSVToArray } from 'convert-csv-to-array';

let sheet = SimpleSpreadSheet.getInstance();

/**
   * to initialize an empty cell array
*/
function initializeEmptyCellArray(): void {
  let initArr: Cell[][] = [[new Cell()]];
  sheet.setCellArray(initArr);
}

/**
 * reseting a spreadsheet
 */
function resetSpreadSheet(): void {
  sheet.setTitle('');
  sheet.setCellArray([]);
  sheet.setReferencedCells(new Map());
  sheet.setRowSize(50);
  sheet.setColSize(26);
}

describe('Spreadsheet', () => {
  beforeEach(() => {
    resetSpreadSheet();
  });

  describe('constructor tests', () => {
    it('initializing an empty spreadsheet object', () => {
      expect(sheet.getTitle()).toEqual('');
      expect(sheet.getCellArray()).toEqual([]);
      expect(sheet.getReferencedCells()).toEqual(new Map());
    });
  });

  describe('instance of the spreadsheet', () => {
    it('getting an instance of the spreadsheet which cannot be null', () => {
      SimpleSpreadSheet.setInstace(SimpleSpreadSheet.getInstance());
      expect(SimpleSpreadSheet.getInstance()).not.toEqual(null);
    });
  });

  describe('setters and getters', () => {
    // reset to default before each block
    beforeEach(() => {
      resetSpreadSheet();
    });

    it('Title', () => {
      expect(sheet.getTitle()).toEqual('');
      sheet.setTitle('Sheet1');
      expect(sheet.getTitle()).toEqual('Sheet1');
    });

    it('Cell Array', () => {
      let sampleCellArray: Cell[][] = [[]];
      sampleCellArray[0][0] = new Cell();

      sheet.setCellArray(sampleCellArray);
      expect(sheet.getCellArray()).toEqual(sampleCellArray);

    });

    it('Col/Row Size', () => {
      // colSize
      expect(sheet.getColSize()).toEqual(26);
      sheet.setColSize(100);
      expect(sheet.getColSize()).toEqual(100);
  
      // rowSize
      expect(sheet.getRowSize()).toEqual(50);
      sheet.setRowSize(2000);
      expect(sheet.getRowSize()).toEqual(2000);
    });

    it('Ref Cell Map', () => {
      // reference cell map array
      let cell1 = new Cell();
      let cell2 = new Cell();
      let cell3 = new Cell();
      let cellMap: Map<Cell, Cell[]> = new Map();
      cellMap.set(cell1, [cell2, cell3]);

      sheet.setReferencedCells(cellMap);
      expect(sheet.getReferencedCells()).toEqual(cellMap);
    });
  });
  
  describe('cell array functionality', () => {
    // reset every block to default before testing
    beforeEach(() => {
      resetSpreadSheet();
    });

    it('testing spreadsheet grid population of empty cells', () => {
      sheet.initializeCellArray();

      expect(sheet.getCellArray()).not.toEqual([]);
      //checks how many rows
      expect(sheet.getCellArray().length).toEqual(50);

      for (let i = 0; i < 50; i++) {
        expect(sheet.getCellArray()[i].length).toEqual(26);
      }
    });
  });

  describe('deleteRow() functionality', () => {
    beforeEach(() => {
      resetSpreadSheet();
    });

    it('Deleting a row from spreadsheet where row exists', () => {
      sheet.initializeCellArray();

      sheet.getCellArray()[2][0].setInput('hello');
      expect(sheet.getCellArray()[2][0].getInput()).toEqual(
        'hello'
      );
      sheet.getCellArray()[3][0].setInput('world');
      expect(sheet.getCellArray()[3][0].getInput()).toEqual(
        'world'
      );

      let deletedCell = sheet.getCellArray()[2][0];
      let shiftedCell = sheet.getCellArray()[3][0];

      sheet.deleteRow(2);

      // Shows delete row shifts all rows below it one index above
      expect(sheet.getCellArray()[2][0].getInput()).toEqual(
        'world'
      );
      expect(sheet.getCellArray()[3][0].getInput()).not.toEqual(
        'world'
      );
      expect(sheet.getCellArray()[2].indexOf(shiftedCell)).toEqual(
        0
      );

      // Checking instance of in every row to make sure cell originally in row 2 doesn't exist in spreadsheet
      sheet.getCellArray().forEach((row) => {
        expect(row.includes(deletedCell)).toBeFalsy();
      });
      
    });

    it('Deleting a row from spreadsheet where row doesn\'t exist', () => {
      sheet.initializeCellArray();
      expect(sheet.getRowSize()).toEqual(50)

      expect(() => {
        sheet.deleteRow(-1);
      }).toThrow('Entered row is out of bounds');
      
      expect(() => {
        sheet.deleteRow(51);
      }).toThrow('Entered row is out of bounds');

    });
  });

  describe('deteleCol() functionality', () => {
    beforeEach(() => {
      resetSpreadSheet();
    });

    it('Deleting a col from spreadsheet', () => {
      sheet.initializeCellArray();

      sheet.getCellArray()[0][2].setInput('999');
      expect(sheet.getCellArray()[0][2].getInput()).toEqual('999');
      sheet.getCellArray()[0][3].setInput('555');
      expect(sheet.getCellArray()[0][3].getInput()).toEqual('555');

      let deletedCell = sheet.getCellArray()[0][2];
      let shiftedCell = sheet.getCellArray()[0][3];

      sheet.deleteCol(2);

      // Shows delete col shifts all col to the right of it one index to the left
      expect(sheet.getCellArray()[0][2].getInput()).toEqual('555');
      expect(sheet.getCellArray()[0][3].getInput()).not.toEqual('555');
      expect(sheet.getCellArray()[0].indexOf(shiftedCell)).toEqual(2);
    });

    it('Deleting a col from spreadsheet which doesn\'t exist', () => {
      sheet.initializeCellArray();
      expect(sheet.getColSize()).toEqual(26)

      expect(() => {
        sheet.deleteCol(-1);
      }).toThrow('Entered col is out of bounds');
      
      expect(() => {
        sheet.deleteCol(100);
      }).toThrow('Entered col is out of bounds');
    });
  });


  describe('addRow() functionality', () => {
    beforeEach(() => {
      resetSpreadSheet();
    });
    it('Inserting a row to the spreadsheet', () => {
      sheet.initializeCellArray();
      sheet.getCellArray()[2][0].setInput('hello');
      expect(sheet.getCellArray()[2][0].getInput()).toEqual(
        'hello'
      );
      sheet.getCellArray()[3][0].setInput('world');
      expect(sheet.getCellArray()[3][0].getInput()).toEqual(
        'world'
      );

      let shiftedCell1 = sheet.getCellArray()[2][0];
      let shiftedCell2 = sheet.getCellArray()[3][0];

      sheet.addRow(2);

      // Shows insert row shifts all rows below it by 1 index. (inserted row would have empty values for its cells)
      // insert row adds a row above
      expect(sheet.getCellArray()[2][0].getInput()).toEqual('');
      expect(sheet.getCellArray()[2][0].getInput()).not.toEqual(
        'hello'
      );
      expect(sheet.getCellArray()[3][0].getInput()).toEqual(
        'hello'
      );
      expect(sheet.getCellArray()[3][0].getInput()).not.toEqual(
        'world'
      );
      expect(sheet.getCellArray()[4][0].getInput()).toEqual(
        'world'
      );
      expect(sheet.getCellArray()[3].indexOf(shiftedCell1)).toEqual(
        0
      );
      expect(sheet.getCellArray()[4].indexOf(shiftedCell2)).toEqual(
        0
      );
    });

    it('Attempting to insert a row to spreadsheet over the predefined limit', () => {
      sheet.initializeCellArray();
      expect(sheet.getColSize()).toEqual(26)
      expect(sheet.getRowSize()).toEqual(50)

      // Limit is set to 1000 
      let currRow = sheet.getRowSize();
      while (currRow < sheet.getLimit()) {
        sheet.addRow(currRow);
        currRow = sheet.getRowSize();
      }

      expect(sheet.getRowSize()).toEqual(1000);
      expect(() => {
        sheet.addRow(sheet.getRowSize());
      }).toThrow('Exceeded spreadsheet row limit');       
    });

  });


  describe('insertCol() functionality', () => {
    beforeEach(() => {
      resetSpreadSheet();
    });
    it('Inserting a col to the spreadsheet', () => {
      sheet.initializeCellArray();
      sheet.getCellArray()[0][2].setInput('hello');
      expect(sheet.getCellArray()[0][2].getInput()).toEqual(
        'hello'
      );
      sheet.getCellArray()[0][3].setInput('world');
      expect(sheet.getCellArray()[0][3].getInput()).toEqual(
        'world'
      );

      let originalCell = sheet.getCellArray()[0][2];
      let shiftedCell = sheet.getCellArray()[0][3];

      sheet.addRow(2);

      // // Shows insert row shifts all rows below it by 1 index. (inserted row would have empty values for its cells)
      // // insert row adds a row above
      // expect(sheet.getCellArray()[2][0].getInput()).toEqual("");
      // expect(sheet.getCellArray()[2][0].getInput()).not.toEqual("hello");
      // expect(sheet.getCellArray()[3][0].getInput()).toEqual("hello");
      // expect(sheet.getCellArray()[3][0].getInput()).not.toEqual("world");
      // expect(sheet.getCellArray()[4][0].getInput()).toEqual("world");
        
    
    });

    it('Attempting to insert a col to spreadsheet over the predefined limit', () => {

      sheet.initializeCellArray();
      expect(sheet.getColSize()).toEqual(26)

      // Limit is set to 1000
      while (sheet.getColSize() < sheet.getLimit()) {
        sheet.addCol(sheet.getColSize())
      }

      expect(sheet.getColSize()).toEqual(1000);
      expect(() => {
        sheet.addCol(sheet.getColSize());
      }).toThrow('Exceeded spreadsheet column limit');  

    });
  });

  describe('clearing a cell', () => {
    it('clearing a cell that has different types of values', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=5');
      sheet.updateSheet(2, 0, '=ref(A1)');

      sheet.clearCellinSheet(0, 0);
      sheet.clearCellinSheet(1, 0);
      sheet.clearCellinSheet(2, 0);

      expect(sheet.getCellArray()[0][0].getValue().valueToString()).toEqual('');
      expect(sheet.getCellArray()[1][0].getValue().valueToString()).toEqual('');
      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('');
    })
  });

  describe('clearRow() functionality', () => {
    beforeEach(() => {
      resetSpreadSheet();
    });

    it('Clearing row that exists', () => {
      sheet.initializeCellArray();
      sheet.updateSheet(0,0, "hello")
      sheet.updateSheet(0,1, "cs")
      sheet.updateSheet(0,2, "4530")
      sheet.updateSheet(2,1, "test")
      
      expect(sheet.getCellArray()[0][0].getInput()).toEqual("hello");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("cs");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("4530");
      expect(sheet.getCellArray()[2][1].getInput()).toEqual("test");

      sheet.clearRow(0);

      expect(sheet.getCellArray()[0][0].getInput()).toEqual("");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("");
      expect(sheet.getCellArray()[2][1].getInput()).toEqual("test");

      sheet.clearRow(2);

      expect(sheet.getCellArray()[2][1].getInput()).toEqual("");
    });

    it('Attempting to clearing row that doesn\'t exist on spreadsheet', () => {
      sheet.initializeCellArray();
      expect(sheet.getRowSize()).toEqual(50)
      

      expect(() => {
        sheet.clearRow(sheet.getRowSize() + 1);
      }).toThrow('Row doesn\'t exist on spreadsheet');  

      expect(() => {
        sheet.clearRow(-1);
      }).toThrow('Row doesn\'t exist on spreadsheet');
      
    });
  });

  describe('clearCol() functionality', () => {
    beforeEach(() => {
      resetSpreadSheet();
    });

    it('Clearing col that exists', () => {
      sheet.initializeCellArray();
      sheet.updateSheet(0,1, "hello")
      sheet.updateSheet(1,1, "cs")
      sheet.updateSheet(2,1, "4530")
      sheet.updateSheet(2,2, "test")

      expect(sheet.getCellArray()[0][1].getInput()).toEqual("hello");
      expect(sheet.getCellArray()[1][1].getInput()).toEqual("cs");
      expect(sheet.getCellArray()[2][1].getInput()).toEqual("4530");
      expect(sheet.getCellArray()[2][2].getInput()).toEqual("test");

      sheet.clearCol(1);

      expect(sheet.getCellArray()[0][1].getInput()).toEqual("");
      expect(sheet.getCellArray()[1][1].getInput()).toEqual("");
      expect(sheet.getCellArray()[2][1].getInput()).toEqual("");
      expect(sheet.getCellArray()[2][2].getInput()).toEqual("test");

      sheet.clearCol(2);

      expect(sheet.getCellArray()[2][2].getInput()).toEqual("");
    });

    it('Attempting to clearing col that doesn\'t exist on spreadsheet', () => {

      sheet.initializeCellArray();
      expect(sheet.getColSize()).toEqual(26)
      

      expect(() => {
        sheet.clearCol(sheet.getColSize() + 1);
      }).toThrow('Column doesn\'t exist on spreadsheet');  

      expect(() => {
        sheet.clearCol(-1);
      }).toThrow('Column doesn\'t exist on spreadsheet');  
      
    });
  });



  describe('remaining functionality', () => {
    beforeEach(() => {
      resetSpreadSheet();
    });

    /**
     * updateSheet method
     */

    it("updateSheet - single cell", () => {
      initializeEmptyCellArray();
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('');
      expect(sheet.getCellArray()[0][0].getValue().isEmpty()).toEqual(true);

      sheet.updateSheet(0,0,'hello');
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('hello');
      expect(sheet.getCellArray()[0][0].getValue().isEmpty()).toEqual(false);
    });

    it("updateSheet - doesn't exist", () => {
      initializeEmptyCellArray();
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('');
      expect(sheet.getCellArray()[0][0].getValue().isEmpty()).toEqual(true);

      expect(() => {
        sheet.updateSheet(100,100, 'hello');
      }).toThrow('Cell does not exist.')    
      
    });

    /**
     * for importing
     */
    it("initializeFromCsvString - initializes an empty spreadsheet from an empty csv string", () => {
      let csvStr = ``
      initializeEmptyCellArray();
      sheet.initializeFromCsvString(csvStr);
      expect(sheet.getCellArray()[0][0].getInput()).toEqual("");
    });

    it("initializeFromCsvString - initializes a spreadsheet from a simple csv string with 1 row", () => {
      let csvStr = `hello,darkness,my old friend\n`
      initializeEmptyCellArray();
      sheet.initializeFromCsvString(csvStr);
      expect(sheet.getCellArray()[0][0].getInput()).toEqual("hello");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("darkness");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("my old friend");
    });

    it("initializeFromCsvString - initializes a spreadsheet from a simple csv string with 2 rows", () => {
      let csvStr = 
      `hello,darkness,my old friend\nI've come to,talk with you,again\n`

      initializeEmptyCellArray();
      sheet.initializeFromCsvString(csvStr);
      expect(sheet.getCellArray()[0][0].getInput()).toEqual("hello");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("darkness");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("my old friend");
      expect(sheet.getCellArray()[1][0].getInput()).toEqual("I've come to");
      expect(sheet.getCellArray()[1][1].getInput()).toEqual("talk with you");
      expect(sheet.getCellArray()[1][2].getInput()).toEqual("again");
    });

    it("initializeFromCsvString - initializes a spreadsheet from a simple csv string with multiple rows", () => {
      let csvStr = 
      `hello,darkness,my old friend
I've come to,talk with you,again
Because a vision softly creeping
Left its seeds while I was sleeping
And the vision, that was planted in my brain
Still remains
Within the sound of silence\n`
      initializeEmptyCellArray();
      sheet.initializeFromCsvString(csvStr);
      expect(sheet.getCellArray()[0][0].getInput()).toEqual("hello");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("darkness");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("my old friend");
      expect(sheet.getCellArray()[1][0].getInput()).toEqual("I've come to");
      expect(sheet.getCellArray()[1][1].getInput()).toEqual("talk with you");
      expect(sheet.getCellArray()[1][2].getInput()).toEqual("again");
      expect(sheet.getCellArray()[2][0].getInput()).toEqual("Because a vision softly creeping");
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("Left its seeds while I was sleeping");
      expect(sheet.getCellArray()[4][0].getInput()).toEqual("And the vision");
      expect(sheet.getCellArray()[4][1].getInput()).toEqual(" that was planted in my brain");
      expect(sheet.getCellArray()[5][0].getInput()).toEqual("Still remains");
      expect(sheet.getCellArray()[6][0].getInput()).toEqual("Within the sound of silence");
    });

    it("cantExceedLimit - throws an error because the number of rows and columns exceeds our limit of 1000", () => {

      sheet.initializeCellArray();

      let input: string = "";
      let arrs = new Array(1001).fill(input).map(() => new Array(2000).fill(input));
      expect(() => {
        sheet.cantExceedLimit(arrs);
      }).toThrow("Ooopsie! Your Spreadsheet is exceeding our limit! You can't have more than 1000 rows or columns.");  
    
    });

    /**
     * for exporting
     */
    it("toCsvString - makes an empty csv string from an empty spreadsheet", () => {
      initializeEmptyCellArray();
      expect(sheet.toCsvString()).toEqual("\n");
    });

    it("toCsvString - makes a csv string with two rows from a 2d array of cells", () => {
      sheet.initializeCellArray();
      sheet.getCellArray()[1][1].setInput('bloop');
      expect(sheet.getCellArray()[1][1].getInput()).toEqual('bloop');

      expect(sheet.toCsvString()).toEqual("\n,bloop\n");
    });
    
    it("toCsvString - makes a csv string with two rows from a 2d array of cells", () => {
      sheet.initializeCellArray();

      sheet.getCellArray()[0][0].setInput('beep');
      sheet.getCellArray()[0][1].setInput('bop');
      sheet.getCellArray()[1][0].setInput('booop');
      sheet.getCellArray()[1][1].setInput('bloop');

      expect(sheet.toCsvString()).toEqual("beep,bop\nbooop,bloop\n");
    });

    it("toCsvString - makes a csv string with two rows from a 2d array of cells", () => {
      sheet.initializeCellArray();
      sheet.getCellArray()[0][1].setInput('hello')
      expect(sheet.getCellArray()[0][1].getInput()).toEqual('hello');
      sheet.getCellArray()[3][4].setInput('sadaf')

      expect(sheet.toCsvString()).toEqual(',hello\n\n\n,,,,sadaf\n');
    });

    it("toCsvString - makes a csv string with 5 rows from a 2d array of cells", () => {
      sheet.initializeCellArray();
      sheet.getCellArray()[0][0].setInput('hello')
      sheet.getCellArray()[1][2].setInput('test')
      sheet.getCellArray()[3][4].setInput('123')
      sheet.getCellArray()[5][6].setInput('test')
      sheet.getCellArray()[6][3].setInput('world')

      expect(sheet.toCsvString()).toEqual('hello'+
      '\n,,test'+
      '\n'+
      '\n,,,,123'+
      '\n'+
      '\n,,,,,,test'+
      '\n,,,world\n');
    });

    it("toCsvString - makes a csv string with 3 rows", () => {
      sheet.initializeCellArray();
      sheet.getCellArray()[0][4].setInput('hello');
      sheet.getCellArray()[0][6].setInput('oi');
      sheet.getCellArray()[1][2].setInput('darkness');
      sheet.getCellArray()[3][2].setInput('my old friend');

      expect(sheet.toCsvString()).toEqual(',,,,hello,,oi'+
      '\n,,darkness'+
      '\n'+
      '\n,,my old friend'+
      '\n');
    });

    it("toCsvString - makes a csv string with 2 row and 3 columns", () => {
      sheet.initializeCellArray();
      sheet.getCellArray()[0][0].setInput('');
      sheet.getCellArray()[0][1].setInput('');
      sheet.getCellArray()[0][2].setInput('oi');
      sheet.getCellArray()[1][2].setInput('oi');

      expect(sheet.toCsvString()).toEqual(',,oi\n,,oi\n');
    });

    // Build a spreadsheet -> Export it -> Import it
    // Compare to orignal spreadsheet

    it("initializeFromCsvString & toCsvString - compare the exported csv to the spreadsheet imported", () => {
      resetSpreadSheet();
      sheet.initializeCellArray();

      sheet.getCellArray()[0][0].setInput('beep');
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('beep');
      sheet.getCellArray()[0][1].setInput('bop');
      expect(sheet.getCellArray()[0][1].getInput()).toEqual('bop');
      sheet.getCellArray()[1][0].setInput('booop');
      expect(sheet.getCellArray()[1][0].getInput()).toEqual('booop');
      sheet.getCellArray()[1][1].setInput('bloop');
      expect(sheet.getCellArray()[1][1].getInput()).toEqual('bloop');

      let str = sheet.toCsvString();
      expect(str).toEqual("beep,bop\nbooop,bloop\n");
      

      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.initializeFromCsvString(str);

      expect(sheet.getCellArray()[0][0].getInput()).toEqual("beep");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("bop");
      expect(sheet.getCellArray()[1][0].getInput()).toEqual("booop");
      expect(sheet.getCellArray()[1][1].getInput()).toEqual("bloop");
    });

    it("setBiggerSize - makes a spreadsheet which have more number of rows and columns than the default number", () => {
      sheet.initializeCellArray();
      expect(sheet.getColSize()).toEqual(26);
      expect(sheet.getRowSize()).toEqual(50);

      const arrs = new Array(70).fill(0).map(() => new Array(60).fill(0));

      sheet.setBiggerSize(arrs);
      expect(sheet.getColSize()).toEqual(60);
      expect(sheet.getRowSize()).toEqual(70);
    });

    it("setBiggerSize - makes a spreadsheet which have more number of rows than the default number", () => {
      sheet.initializeCellArray();
      expect(sheet.getColSize()).toEqual(26);
      expect(sheet.getRowSize()).toEqual(50);

      const arrs = new Array(770).fill(0).map(() => new Array(26).fill(0));

      sheet.setBiggerSize(arrs);
      expect(sheet.getColSize()).toEqual(26);
      expect(sheet.getRowSize()).toEqual(770);
    });

    it("setBiggerSize - makes a spreadsheet which have more number of columns than the default number", () => {
      sheet.initializeCellArray();
      expect(sheet.getColSize()).toEqual(26);
      expect(sheet.getRowSize()).toEqual(50);

      const arrs = new Array(50).fill(0).map(() => new Array(260).fill(0));

      sheet.setBiggerSize(arrs);
      expect(sheet.getColSize()).toEqual(260);
      expect(sheet.getRowSize()).toEqual(50);
    });

    it("setBiggerSize - should not change the size because the given number of rows and cols is not bigger than the default", () => {
      sheet.initializeCellArray();
      
      const arrs = new Array(4).fill("woot woot").map(() => new Array(7).fill("chicken"));
      sheet.setBiggerSize(arrs);
      expect(sheet.getColSize()).not.toEqual(7);
      expect(sheet.getRowSize()).not.toEqual(4);
      expect(sheet.getColSize()).toEqual(26);
      expect(sheet.getRowSize()).toEqual(50);
    });

    it("setBiggerSize - should not change the size because the given number of rows and cols exceed the limit", () => {
      sheet.initializeCellArray();
      
      const arrs = new Array(4000).fill("bruh").map(() => new Array(71111).fill("oii"));
      sheet.setBiggerSize(arrs);
      expect(sheet.getColSize()).not.toEqual(71111);
      expect(sheet.getRowSize()).not.toEqual(4000);
      expect(sheet.getColSize()).toEqual(26);
      expect(sheet.getRowSize()).toEqual(50);
    });

  });

  describe('testing updated inputs for addRow', () => {
    it('testing updated inputs for addRow with a Ref', () => {
      resetSpreadSheet;
      sheet.initializeCellArray();

      sheet.updateSheet(0,0,"1"); // A1
      sheet.updateSheet(1,0,"2"); // A2
      sheet.updateSheet(2,0,"3"); // A3
      sheet.updateSheet(3,0,"=ref(A2)"); // A4
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("=ref(A2)")
      expect(sheet.getCellArray()[3][0].getValue().valueToString()).toEqual("2");
      
      sheet.addRow(0);
      expect(sheet.getCellArray()[0][0].getInput()).toEqual("");
      expect(sheet.getCellArray()[1][0].getInput()).toEqual("1");
      expect(sheet.getCellArray()[2][0].getInput()).toEqual("2");
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("3");
      expect(sheet.getCellArray()[4][0].getInput()).toEqual("=ref(A3)");
      expect(sheet.getCellArray()[4][0].getValue().valueToString()).toEqual("2");
      
    });

    it('testing updated inputs for addRow with a Formula', () => {
      resetSpreadSheet;
      sheet.initializeCellArray()

      sheet.updateSheet(0,0,"1"); // A1
      sheet.updateSheet(1,0,"2"); // A2
      sheet.updateSheet(2,0,"3"); // A3
      sheet.updateSheet(3,0,"=avg(A1:A3)"); // A4
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("=avg(A1:A3)") 
      expect(sheet.getCellArray()[3][0].getValue().valueToString()).toEqual("2");
      
      sheet.addRow(1);

      expect(sheet.getCellArray()[0][0].getInput()).toEqual("1");
      expect(sheet.getCellArray()[1][0].getInput()).toEqual("");
      expect(sheet.getCellArray()[2][0].getInput()).toEqual("2");
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("3");
      expect(sheet.getCellArray()[4][0].getInput()).toEqual("=avg(A1:A4)");
      expect(sheet.getCellArray()[4][0].getValue().valueToString()).toEqual("2");
      
      
    });
    it('helper test', () => {
      expect(sheet.arrayHelper('=avg(A1:A4)')).toEqual(['=', 'avg(', 'A1', ':', 'A4', ')', '']);
    });

    it('testing updated inputs for addRow with a Ref & Formula', () => {
      resetSpreadSheet;
      sheet.initializeCellArray()

      sheet.updateSheet(0,0,"1"); // A1
      sheet.updateSheet(1,0,"2"); // A2
      sheet.updateSheet(2,0,"3"); // A3
      sheet.updateSheet(3,0,"=ref(A2) + avg(A1:A3)"); // A4
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("=ref(A2) + avg(A1:A3)") 
      expect(sheet.getCellArray()[3][0].getValue().valueToString()).toEqual("4");
      
      sheet.addRow(1);

      expect(sheet.getCellArray()[0][0].getInput()).toEqual("1");
      expect(sheet.getCellArray()[1][0].getInput()).toEqual("");
      expect(sheet.getCellArray()[2][0].getInput()).toEqual("2");
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("3");
      expect(sheet.getCellArray()[4][0].getInput()).toEqual("=ref(A3)+avg(A1:A4)");
      expect(sheet.getCellArray()[4][0].getValue().valueToString()).toEqual("4");

    });
    // only double refs
    it('testing updated inputs for addRow with a Ref & Formula', () => {
      resetSpreadSheet;
      sheet.initializeCellArray()

      sheet.updateSheet(0,0,"1"); // A1
      sheet.updateSheet(1,0,"2"); // A2
      sheet.updateSheet(2,0,"3"); // A3
      sheet.updateSheet(3,0,"=ref(A2) + ref(A3)"); // A4
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("=ref(A2) + ref(A3)") 
      expect(sheet.getCellArray()[3][0].getValue().valueToString()).toEqual("5");
      
      sheet.addRow(0);

      expect(sheet.getCellArray()[0][0].getInput()).toEqual("");
      expect(sheet.getCellArray()[1][0].getInput()).toEqual("1");
      expect(sheet.getCellArray()[2][0].getInput()).toEqual("2");
      expect(sheet.getCellArray()[3][0].getInput()).toEqual("3");
      expect(sheet.getCellArray()[4][0].getInput()).toEqual("=ref(A3)+ref(A4)");
      expect(sheet.getCellArray()[4][0].getValue().valueToString()).toEqual("5");

    });
  });

  describe('testing updated inputs for addCol', () => {
    it('testing updated inputs for addRow with a Ref', () => {
      resetSpreadSheet;
      sheet.initializeCellArray()

      sheet.updateSheet(0,0,"1"); // A1
      sheet.updateSheet(0,1,"2"); // B1
      sheet.updateSheet(0,2,"3"); // C1
      sheet.updateSheet(0,3,"=ref(C1)"); // D1
      expect(sheet.getCellArray()[0][3].getInput()).toEqual("=ref(C1)")
      expect(sheet.getCellArray()[0][3].getValue().valueToString()).toEqual("3");
      
      
      sheet.addCol(0);

      expect(sheet.getCellArray()[0][0].getInput()).toEqual("");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("1");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("2");
      expect(sheet.getCellArray()[0][3].getInput()).toEqual("3");
      expect(sheet.getCellArray()[0][4].getInput()).toEqual("=ref(D1)");
      expect(sheet.getCellArray()[0][4].getValue().valueToString()).toEqual("3");

    });

    it('testing updated inputs for addRow with a Formula', () => {
      resetSpreadSheet;
      sheet.initializeCellArray()

      sheet.updateSheet(0,0,"1"); // A1
      sheet.updateSheet(0,1,"2"); // B1
      sheet.updateSheet(0,2,"3"); // C1
      sheet.updateSheet(0,3,"=sum(A1:C1)"); // D1
      expect(sheet.getCellArray()[0][3].getInput()).toEqual("=sum(A1:C1)")
      expect(sheet.getCellArray()[0][3].getValue().valueToString()).toEqual("6");
      
      
      sheet.addCol(0);

      expect(sheet.getCellArray()[0][0].getInput()).toEqual("");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("1");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("2");
      expect(sheet.getCellArray()[0][3].getInput()).toEqual("3");
      expect(sheet.getCellArray()[0][4].getInput()).toEqual("=sum(B1:D1)");
      expect(sheet.getCellArray()[0][4].getValue().valueToString()).toEqual("6");

      
    });

    it('testing updated inputs for addRow with a Ref & Formula', () => {
      resetSpreadSheet;
      sheet.initializeCellArray()

      sheet.updateSheet(0,0,"1"); // A1
      sheet.updateSheet(0,1,"2"); // B1
      sheet.updateSheet(0,2,"3"); // C1
      sheet.updateSheet(0,3,"=ref(A1) + sum(A1:C1)"); // D1
      expect(sheet.getCellArray()[0][3].getInput()).toEqual("=ref(A1) + sum(A1:C1)")
      expect(sheet.getCellArray()[0][3].getValue().valueToString()).toEqual("7");

      sheet.addCol(1);
      expect(sheet.getCellArray()[0][0].getInput()).toEqual("1");
      expect(sheet.getCellArray()[0][1].getInput()).toEqual("");
      expect(sheet.getCellArray()[0][2].getInput()).toEqual("2");
      expect(sheet.getCellArray()[0][3].getInput()).toEqual("3");
      expect(sheet.getCellArray()[0][4].getInput()).toEqual("=ref(A1)+sum(A1:D1)");
      expect(sheet.getCellArray()[0][4].getValue().valueToString()).toEqual("7");

    });
  });

  describe('testing updated inputs for deleteRow', () => {
    it('testing updated inputs for deleteRow with a Ref', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '5');
      sheet.updateSheet(3, 0, '=ref(A3)');
      
      sheet.deleteRow(1);      
      
      expect(sheet.getCellArray()[0][0].getValue().valueToString()).toEqual('3');
      expect(sheet.getCellArray()[1][0].getInput()).toEqual('5');
      expect(sheet.getCellArray()[2][0].getInput()).toEqual('=ref(A2)');
      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('5');
    });

    it('testing updated inputs for deleteRow with a Formula', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '5');
      sheet.updateSheet(3, 0, '=sum(A1:A3)');
      
      sheet.deleteRow(1);      
      
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('3');
      expect(sheet.getCellArray()[1][0].getInput()).toEqual('5');
      expect(sheet.getCellArray()[2][0].getInput()).toEqual('=sum(A1:A2)');
      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('8');
    });

    it('testing updated inputs for deleteRow with a Ref & Formula, throws a delete error', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3'); // a1
      sheet.updateSheet(1, 0, '4'); // a2
      sheet.updateSheet(2, 0, '5'); // a3
      sheet.updateSheet(3, 0, '=ref(A3)+sum(A1:A2)'); // a4
      
      sheet.deleteRow(1);      
      
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('3');
      expect(sheet.getCellArray()[1][0].getInput()).toEqual('5');
      expect(sheet.getCellArray()[2][0].getInput()).toEqual('Reference deleted, does not exist');
      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('Reference deleted, does not exist');
    });

    it('testing updated inputs for deleteRow with a Ref & Formula, proper', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3'); // a1
      sheet.updateSheet(1, 0, '4'); // a2
      sheet.updateSheet(2, 0, '5'); // a3
      sheet.updateSheet(3, 0, '=ref(A3)+sum(A1:A3)'); // a4
      
      sheet.deleteRow(1);      
      
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('3');
      expect(sheet.getCellArray()[1][0].getInput()).toEqual('5');
      expect(sheet.getCellArray()[2][0].getInput()).toEqual('=ref(A2)+sum(A1:A2)');
      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('13');
    });
  });

  describe('testing updated inputs for deleteCol', () => {
    it('testing updated inputs for deleteCol with a Ref', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3');
      sheet.updateSheet(0, 1, '4');
      sheet.updateSheet(0, 2, '5');
      sheet.updateSheet(0, 3, '=ref(C1)');
      
      sheet.deleteCol(1);      
      
      expect(sheet.getCellArray()[0][0].getValue().valueToString()).toEqual('3');
      expect(sheet.getCellArray()[0][1].getInput()).toEqual('5');
      expect(sheet.getCellArray()[0][2].getInput()).toEqual('=ref(B1)');
      expect(sheet.getCellArray()[0][2].getValue().valueToString()).toEqual('5');
    });

    it('testing updated inputs for deleteCol with a Formula', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3');
      sheet.updateSheet(0, 1, '4');
      sheet.updateSheet(0, 2, '5');
      sheet.updateSheet(0, 3, '=sum(A1:C1)');
      
      sheet.deleteCol(1);      
      
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('3');
      expect(sheet.getCellArray()[0][1].getInput()).toEqual('5');
      expect(sheet.getCellArray()[0][2].getInput()).toEqual('=sum(A1:B1)');
      expect(sheet.getCellArray()[0][2].getValue().valueToString()).toEqual('8');
    });

    it('testing updated inputs for deleteCol with a Ref & Formula, throws a delete error', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3'); 
      sheet.updateSheet(0, 1, '4'); 
      sheet.updateSheet(0, 2, '5'); 
      sheet.updateSheet(0, 3, '=ref(C1)+sum(A1:B1)'); 
      
      sheet.deleteCol(1);      
      
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('3');
      expect(sheet.getCellArray()[0][1].getInput()).toEqual('5');
      expect(sheet.getCellArray()[0][2].getInput()).toEqual('Reference deleted, does not exist');
      expect(sheet.getCellArray()[0][2].getValue().valueToString()).toEqual('Reference deleted, does not exist');
    });

    it('testing updated inputs for deleteCol with a Ref & Formula, proper', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3'); // a1
      sheet.updateSheet(0, 1, '4'); // a2
      sheet.updateSheet(0, 2, '5'); // a3
      sheet.updateSheet(0, 3, '=ref(C1)+sum(A1:C1)'); // a4
      
      sheet.deleteCol(1);      
      
      expect(sheet.getCellArray()[0][0].getInput()).toEqual('3');
      expect(sheet.getCellArray()[0][1].getInput()).toEqual('5');
      expect(sheet.getCellArray()[0][2].getInput()).toEqual('=ref(B1)+sum(A1:B1)');
      expect(sheet.getCellArray()[0][2].getValue().valueToString()).toEqual('13');
    });
  });
});

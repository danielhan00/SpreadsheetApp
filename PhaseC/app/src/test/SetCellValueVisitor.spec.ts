import { Cell } from '../backend/Cell/Cell';
import { VString } from '../backend/Values/VString';
import { SetCellValueVisitor } from '../backend/Visitor/SetCellValueVisitor';
import { VError } from '../backend/Values/VError';
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';

// singleton
let sheet = SimpleSpreadSheet.getInstance();

function resetSpreadSheet(): void {
  sheet.setTitle('');
  sheet.setCellArray([]);
  sheet.setReferencedCells(new Map());
  sheet.setRowSize(50);
  sheet.setColSize(26);
}

describe('SetCellValueVisitor tests', () => {
  // testing cells
  const cell: Cell = new Cell();
  const a1 = new Cell();
  const a2 = new Cell();
  const a3 = new Cell();
  const a4 = new Cell();
  const a5 = new Cell();
  const b1 = new Cell();
  const b2 = new Cell();

  SimpleSpreadSheet.getInstance();
  sheet.initializeCellArray();

  describe('No Equals Sign', () => {
    it('no equals sign empty', () => {
      cell.setInput('');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('');
    });
    it('no equals sign string 1', () => {
      cell.setInput('Khoury');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('Khoury');
    });
    it('no equals sign string 2', () => {
      cell.setInput('C5');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('C5');
    });
    it('no equals sign string 3', () => {
      cell.setInput('!@#$%$%^1=2345daniel');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('!@#$%$%^1=2345daniel');
    });
  });

  describe('Equals Sign with strings', () => {
    it('string surrounded by quotes proper 1', () => {
      cell.setInput('="boston1"');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('boston1');
    });
    it('string surrounded by quotes proper 2', () => {
      cell.setInput('="55"');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('55');
    });
    it('string surrounded by quotes proper 3', () => {
      cell.setInput('="!@#$%$%^12345daniel"');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('!@#$%$%^12345daniel');
    });
    it('string surrounded by nested quotes', () => {
      cell.setInput('="oba\\"ma"');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('oba"ma');
    });
    it('string surrounded by quotes improper 1', () => {
      cell.setInput('="boston');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().isError()).toEqual(true);
    });
    it('string surrounded by quotes improper 2', () => {
      cell.setInput('=boston"');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().isError()).toEqual(true);
    });
  });

  describe('No Equals Sign', () => { 
    it('calling just an equals sign', () => {
      cell.setInput('=');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().isError()).toEqual(true);
    });
    it('calling just an equals sign with spaces', () => {
      cell.setInput('= ');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().isError()).toEqual(true);
    });
  });


  describe('Formulas', () => {
    it('calling for formulas with an error in the range', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '2'); // a1 arg1
      sheet.updateSheet(1, 0, '=2/0'); // a2 arg2
      sheet.updateSheet(2, 0, '=avg(A1:A2)'); //a3
      
      expect(sheet.getCellArray()[1][0].getValue().isError()).toEqual(true);
      expect(sheet.getCellArray()[2][0].getValue().isError()).toEqual(true);
    });

    it('calling for formulas with an cells with valid formats' + 
    'but not in the spreadsheet', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=avg(A2:A51)');

      expect(sheet.getCellArray()[0][0].getValue().isError()).toEqual(true);
    });

    it('calling for formulas that dont exist', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '2');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '=neu(A1:A2)');
      expect(sheet.getCellArray()[2][0].getValue().isError()).toEqual(true);
    });

    it('calling for formulas with valid format but incorrect char length', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '2');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '=5+average(A1:A2)');
      expect(sheet.getCellArray()[2][0].getValue().isError()).toEqual(true);
    });

    it('sum/avg of empty cells is 0', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(2, 0, '=sum(A1:A2)');
      sheet.updateSheet(3, 0, '=avg(A1:A2)');

      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('0');
      expect(sheet.getCellArray()[3][0].getValue().valueToString()).toEqual('0');
    });
    it('proper avg format and testing with refs', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      // A1
      // Row = 1 = index: 0
      // Col = A = index: 0
      sheet.updateSheet(0, 0, '4');
      expect(
        sheet.getCellArray()[0][0].getValue().valueToString()
      ).toEqual('4');

      // A2
      // Row = 2 = index: 1
      // Col = A = index: 0
      sheet.updateSheet(1, 0, '8');
      expect(
        sheet.getCellArray()[1][0].getValue().valueToString()
      ).toEqual('8');

      // A3
      // Row = 3 = index: 2
      // Col = A = index: 0
      sheet.updateSheet(2, 0, '=avg(A1:A2)');
      expect(
        sheet.getCellArray()[2][0].getValue().valueToString()
      ).toEqual('6');

      // A4
      // Row = 4 = index: 3
      // Col = A = index: 0
      sheet.updateSheet(3, 0, '=sum(A1:B3)');
      expect(
        sheet.getCellArray()[3][0].getValue().valueToString()
      ).toEqual('18');
    });
    it('update cell Ref', () => {
      sheet.updateSheet(0, 0, '1');
      sheet.updateSheet(1, 0, '2');
      sheet.updateSheet(0, 1, '=sum(A1:A2)');
    });

    it('proper sum format and testing with refs', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '1');
      sheet.updateSheet(1, 0, '2');
      sheet.updateSheet(0, 1, '=sum(A1:A2)');
      expect(
        sheet.getCellArray()[0][1].getValue().valueToString()
      ).toEqual('3');

      sheet.updateSheet(2, 0, '2.5');
      sheet.updateSheet(0, 1, '=sum(A1:A3)');
      expect(
        sheet.getCellArray()[0][1].getValue().valueToString()
      ).toEqual('5.5');

      // testing cells that are referencing other cells
      sheet.updateSheet(1, 0, '=ref(A1)');
      sheet.updateSheet(2, 0, '3');
      sheet.updateSheet(0, 1, '=sum(A1:A3)');
      expect(
        sheet.getCellArray()[0][1].getValue().valueToString()
      ).toEqual('5');

      sheet.updateSheet(3, 0, '2');
      sheet.updateSheet(0, 1, '=sum(A1:A4)');
      expect(
        sheet.getCellArray()[0][1].getValue().valueToString()
      ).toEqual('7');
    });

    it('improper avg format', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=avg(B1:B3');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=avgB1:B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=average(B1:B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=avg(B1,B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=avg(B1 B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=avg(B1: )');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=avg( :B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      cell.setInput('avg(B1:B3)');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('avg(B1:B3)');
    });

    it('improper sum format', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=sum(B1:B3');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=sumB1:B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=summation(B1:B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=sum(B1,B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=sum(B1 B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=sum(B1: )');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(0, 0, '=sum( :B3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      cell.setInput('sum(B1:B3)');
      cell.accept(new SetCellValueVisitor());
      expect(cell.getValue().valueToString()).toEqual('sum(B1:B3)');
    });

    it('improper values in sum', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '1');
      sheet.updateSheet(1, 0, '2');
      sheet.updateSheet(2, 0, 'daniel');
      sheet.updateSheet(3, 0, '=sum(A1:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().isError()
      ).toEqual(true);

      // A1 = A3, A3 = A1 - cyclical referencing of cells
      sheet.updateSheet(0, 0, '=ref(A2)');
      sheet.updateSheet(1, 0, '=ref(A1)');
      sheet.updateSheet(2, 0, '=sum(A1:A2)');
      // errors, but should be errors of different types
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);
      expect(
        sheet.getCellArray()[1][0].getValue().isError()
      ).toEqual(true);
      expect(
        sheet.getCellArray()[2][0].getValue().isError()
      ).toEqual(true);

      // ZZZZ4 = cell doesn't exist
      sheet.updateSheet(0, 0, '=SUM(A3:ZZZZ4)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      // A!5 = cell has wrong format
      sheet.updateSheet(0, 0, '=SUM(A!1:C3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);
    });

    it('improper values in avg', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '1');
      sheet.updateSheet(1, 0, '2');
      sheet.updateSheet(2, 0, 'daniel');
      sheet.updateSheet(3, 0, '=avg(A1:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().isError()
      ).toEqual(true);

      // A1 = A3, A3 = A1 - cyclical referencing of cells
      sheet.updateSheet(0, 0, '=ref(A2)');
      sheet.updateSheet(1, 0, '=ref(A1)');
      sheet.updateSheet(2, 0, '=avg(A1:A2)');
      // errors, but should be errors of different types
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);
      expect(
        sheet.getCellArray()[1][0].getValue().isError()
      ).toEqual(true);
      expect(
        sheet.getCellArray()[2][0].getValue().isError()
      ).toEqual(true);

      // ZZZZ4 = cell doesn't exist
      sheet.updateSheet(0, 0, '=avg(A3:ZZZZ4)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);

      // A!5 = cell has wrong format
      sheet.updateSheet(0, 0, '=avg(A!1:C3)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);
    });

    it('proper avgs with just numbers', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '2.0');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '6');
      sheet.updateSheet(3, 0, '=avg(A1:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().valueToString()
      ).toEqual('4');
      sheet.updateSheet(4, 0, '=avg(A2:A3)');
      expect(
        sheet.getCellArray()[4][0].getValue().valueToString()
      ).toEqual('5');
    });
    it('proper sums with just numbers', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();

      sheet.updateSheet(0, 0, '2.0');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '6.1');
      sheet.updateSheet(3, 0, '=SUM(A1:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().valueToString()
      ).toEqual('12.1');

      sheet.updateSheet(4, 0, '=SUM(A2:A3)');
      expect(
        sheet.getCellArray()[4][0].getValue().valueToString()
      ).toEqual('10.1');
    });

    it('proper avg with numbers and refs', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();

      // A1 = 2.0, A2 = 4, A3 = A4, A4 = 1
      sheet.updateSheet(0, 0, '2.0');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '=ref(A4)');
      sheet.updateSheet(3, 0, '1');

      sheet.updateSheet(4, 0, '=AVG(A1:A4)');
      expect(
        sheet.getCellArray()[4][0].getValue().valueToString()
      ).toEqual('2');

      sheet.updateSheet(4, 0, '=AVG(A2:A3)');
      expect(
        sheet.getCellArray()[4][0].getValue().valueToString()
      ).toEqual('2.5');
    });

    it('proper sum with numbers and refs', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();

      // A1 = 2.0, A2 = 4, A3 = A4, A4 = 1
      sheet.updateSheet(0, 0, '2.0');
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '=ref(A4)');
      sheet.updateSheet(3, 0, '1');

      sheet.updateSheet(4, 0, '=sum(A1:A4)');
      expect(
        sheet.getCellArray()[4][0].getValue().valueToString()
      ).toEqual('8');

      sheet.updateSheet(4, 0, '=SUM(A2:A3)');
      expect(
        sheet.getCellArray()[4][0].getValue().valueToString()
      ).toEqual('5');
    });
    it('proper sum with numbers and refs, different row and col', () => {
      sheet.updateSheet(0, 0, '1');
      sheet.updateSheet(0, 1, '2');
      sheet.updateSheet(1, 0, '3');
      sheet.updateSheet(1, 1, '4');
      sheet.updateSheet(3, 3, '=sum(A1:B2)');
      expect(
        sheet.getCellArray()[3][3].getValue().valueToString()
      ).toEqual('10');
    });
    it('proper avg with numbers and refs, different row and col', () => {
      sheet.updateSheet(0, 0, '0');
      sheet.updateSheet(0, 1, '2');
      sheet.updateSheet(1, 0, '3');
      sheet.updateSheet(1, 1, '3');
      sheet.updateSheet(3, 3, '=avg(A1:B2)');
      expect(
        sheet.getCellArray()[3][3].getValue().valueToString()
      ).toEqual('2');
    });
    it('improper error sum with refs', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '4');
      sheet.updateSheet(1, 0, '=ref(A3)');
      sheet.updateSheet(2, 0, '=ref(A2)');
      sheet.updateSheet(3, 0, '=sum(A1:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().isError()
      ).toEqual(true);
    });
    it('improper sum with VError cells', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.getCellArray()[0][0].setValue(new VError('test error'));
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '6.1');
      sheet.updateSheet(3, 0, '=SUM(A1:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().isError()
      ).toEqual(true);
    });
    it('improper avg with VError cells', () => {
      resetSpreadSheet();
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.getCellArray()[0][0].setValue(new VError('test error'));
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '6.1');
      sheet.updateSheet(3, 0, '=avg(A1:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().isError()
      ).toEqual(true);
    });

    it('formulas with ranges in greater to less order', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '5');
      sheet.updateSheet(1, 0, '3');
      sheet.updateSheet(2, 0, '=avg(A2:A1)');

      sheet.updateSheet(0, 1, '3');
      sheet.updateSheet(0, 2, '=avg(B1:A1)');

      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('4');
      expect(sheet.getCellArray()[0][2].getValue().valueToString()).toEqual('4');
    });
  });

  describe('Operations', () => {
    describe('String concat', () => {
      it('valid string concat 1', () => {
        a1.setInput('="hello"+" world"');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('hello world');
      });
      it('valid string concat 2', () => {
        a1.setInput('="hello"+" world"+"!!"');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('hello world!!');
      });
      it('valid string concat 3', () => {
        a1.setInput('="hello"+" \\"world\\""+"!!"');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('hello "world"!!');
      });
      it('invalid string concat 1', () => {
        a1.setInput('="hello"+');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
      it('invalid string concat 2', () => {
        a1.setInput('="+"hello"');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
      it('invalid string concat nested quotes with spaces 1', () => {
        a1.setInput('="hello"+"  "world  ""+"!!"');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
      it('invalid string concat extra arg', () => {
        a1.setInput('="hello"+" world"+');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
    });

    describe('Just numbers', () => {
      it('valid order of operations 1', () => {
        a1.setInput('=4+2*6');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('16');
      });
      it('valid order of operations 2', () => {
        a1.setInput('=4.0-6/2');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('1');
      });
      it('valid order of operations 3', () => {
        a1.setInput('=2*3-4');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('2');
      });
      it('valid order of operations with parens', () => {
        a1.setInput('=2*(3+3)');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('12');
      });
      it('valid format with spaces', () => {
        a1.setInput('=2 * 3 - 4');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('2');
      });
      it('valid format with irrational numbers', () => {
        a1.setInput('=22/7');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().valueToString()).toEqual('3.142857142857143');
      });
      it('invalid format with parens 1', () => {
        a1.setInput('=2 * (3 - 4');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
      it('invalid format with parens 2', () => {
        a1.setInput('=2 * )3 - 4(');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
      it('invalid inputs for non plus operations', () => {
        a1.setInput('=2..0-1')
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);

        a1.setInput('=2! 5 --');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);

        a1.setInput('=2..0*1')
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);

        a1.setInput('=2! 5 *-');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);

        a1.setInput('=2..0/1')
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);

        a1.setInput('=2! 5 /-');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
      it('illegal number of arguments', () => {
        a1.setInput('=2+');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);

        a1.setInput('=+4-');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
      it('illegal argument due to blacklist mathjs syntax test', () => {
        a1.setInput('=१+1');
        a1.accept(new SetCellValueVisitor());
        expect(a1.getValue().isError()).toEqual(true);
      });
    });

    describe('operations with references', () => {
      it('empty cellRef within a range!', () => {
        resetSpreadSheet();
        sheet.initializeCellArray();
        sheet.updateSheet(2, 0, '=2+ref(A1)');
        expect(
          sheet.getCellArray()[2][0].getValue().valueToString()
        ).toEqual('2');
      });
      it('addition/mult with valid ref, nested refs', () => {
        resetSpreadSheet();
        sheet.initializeCellArray();
        sheet.updateSheet(0, 0, '4.0');
        sheet.updateSheet(1, 0, '=ref(A1)');
        sheet.updateSheet(2, 0, '=2+4*ref(A2)');
        expect(
          sheet.getCellArray()[2][0].getValue().valueToString()
        ).toEqual('18');
      });
      it('addition/mult with valid ref, not nested refs', () => {
        resetSpreadSheet();
        sheet.initializeCellArray();
        sheet.updateSheet(0, 0, '4.0');
        sheet.updateSheet(1, 0, '=2+4*ref(A1)');
        expect(
          sheet.getCellArray()[1][0].getValue().valueToString()
        ).toEqual('18');
      });
      it('addition with invalid ref with error', () => {
        resetSpreadSheet();
        sheet.initializeCellArray();
        sheet.updateSheet(0, 0, 'dummy');
        sheet.getCellArray()[0][0].setValue(
          new VError('kissinger')
        );
        sheet.updateSheet(1, 0, '=ref(A1) + "stupid"');
        expect(
          sheet.getCellArray()[1][0].getValue().isError()
        ).toEqual(true);
      });
      it('string concat with empty and numbers', () => {
        resetSpreadSheet();
        sheet.initializeCellArray();
        sheet.updateSheet(0, 0, '4');
        // a2 empty
        sheet.updateSheet(2, 0, '=ref(A1)+"harry styles"')
        sheet.updateSheet(3, 0, '=ref(A2)+"kanye"')

        expect(sheet.getCellArray()[2][0].getValue().isError()).toEqual(true);
        expect(sheet.getCellArray()[3][0].getValue().valueToString()).toEqual('kanye');

      });
      it('string concat with string as ref', () => {
        resetSpreadSheet();
        sheet.initializeCellArray();
        sheet.updateSheet(0, 0, 'Jay');
        sheet.updateSheet(2, 0, '=ref(A1)+"Z"')

        expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('JayZ');
      });
      it('number attempted to add with referenced string', () => {
        resetSpreadSheet();
        sheet.initializeCellArray();
        sheet.updateSheet(0, 0, '="Rubik"');
        sheet.updateSheet(2, 0, '=ref(A1)+4');
        expect(sheet.getCellArray()[2][0].getValue().isError()).toEqual(true);
      });
      describe('operation that include a formula', () => {
        it('sum with refs and formulas', () => {
          resetSpreadSheet();
          sheet.initializeCellArray();
          sheet.updateSheet(0, 1, '4');
          sheet.updateSheet(1, 1, '6');
          sheet.updateSheet(2, 0, '=5+sum(B1:B2)');
          sheet.updateSheet(3, 0, '=5+avg(B1:B2)');
          expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('15');
          expect(sheet.getCellArray()[3][0].getValue().valueToString()).toEqual('10');
        });
      });

    });
  });

  describe('Refs', () => {
    it('improper avg with invalid reference cells', () => {
      resetSpreadSheet();
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.getCellArray()[0][0].setValue(new VError('test error'));
      sheet.updateSheet(1, 0, '4');
      sheet.updateSheet(2, 0, '6.1');
      sheet.updateSheet(3, 0, '=avg(22:A3)');
      expect(
        sheet.getCellArray()[3][0].getValue().isError()
      ).toEqual(true);
    });

    it('referencing a cell with valid format outside of sheet', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=ref(A51)');
      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);
    });

    it('proper ref format and exists 1', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, 'husky');
      sheet.updateSheet(1, 0, '=ref(A1)');
      expect(
        sheet.getCellArray()[1][0].getValue().valueToString()
      ).toEqual('husky');
    });
    it('proper ref format and exists 2', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, 'husky1');
      sheet.updateSheet(1, 0, '=ref(A1)');
      expect(
        sheet.getCellArray()[1][0].getValue().valueToString()
      ).toEqual('husky1');
    });
    it('proper ref format and exists leveled', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, 'husky2');
      sheet.updateSheet(1, 0, '=ref(A1)');
      sheet.updateSheet(2, 0, '=ref(A2)');
      expect(
        sheet.getCellArray()[2][0].getValue().valueToString()
      ).toEqual('husky2');
    });
    it('two refs together', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=1');
      sheet.updateSheet(1, 0, '=2');
      sheet.updateSheet(2, 0, '=ref(A1) + ref(A2)');
      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('3');
    })
    it('two refs together substraction', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=1');
      sheet.updateSheet(1, 0, '=2');
      sheet.updateSheet(2, 0, '=ref(A2) - ref(A1)');
      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('1');
    })
    it('ref + formula together', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=1');
      sheet.updateSheet(1, 0, '=2');
      sheet.updateSheet(2, 0, '=ref(A1) + sum(A1:A2)');
      expect(
        sheet.getCellArray()[2][0].getValue().valueToString()
      ).toEqual('4');
    })
    it('catching cyclical ref level one', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.getCellArray()[1][0].setValue(new VString('Reagan'));
      sheet.updateSheet(0, 0, '=ref(A2)');
      sheet.updateSheet(1, 0, '=ref(A1)');

      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);
      expect(
        sheet.getCellArray()[1][0].getValue().isError()
      ).toEqual(true);

      sheet.updateSheet(1, 0, '=2');

      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(false);
      expect(
        sheet.getCellArray()[1][0].getValue().isError()
      ).toEqual(false);
    });
    it('catching cyclical ref level two', () => {
      // a1 = a2 <---|       // map ((a2 => a1))
      // |           |
      // V           |
      // a2 = a3     |       // map ((a2 => a1), (a3 => a2))
      // |           |       // remove ((a4 => a2))
      // V           |       // resetting the map REMOVE (a2 => a1) //
      // a3 = a1     |       //evaluating the input again, re-set (a2 => a1)
      // |           |
      // -------------
      //
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=ref(A2)'); // throws a general reference error (cannot reference a cell with an error)
      sheet.updateSheet(1, 0, '=ref(A3)'); // throws a general reference error (cannot reference a cell with an error)
      sheet.updateSheet(2, 0, '=ref(A1)'); // throws a cyclical reference error specifically

      expect(
        sheet.getCellArray()[0][0].getValue().isError()
      ).toEqual(true);
      expect(
        sheet.getCellArray()[1][0].getValue().isError()
      ).toEqual(true);
      expect(
        sheet.getCellArray()[2][0].getValue().isError()
      ).toEqual(true);
    });
    it('improper ref format 1', () => {
      a1.setInput('=ref(A3');
      a1.accept(new SetCellValueVisitor());
      expect(a1.getValue().isError()).toEqual(true);
    });
    it('improper ref format 2', () => {
      a1.setInput('=refA3)');
      a1.accept(new SetCellValueVisitor());
      expect(a1.getValue().isError()).toEqual(true);
    });
    it('improper ref format 3', () => {
      a1.setInput('=re(A3)');
      a1.accept(new SetCellValueVisitor());
      expect(a1.getValue().isError()).toEqual(true);
    });
    it('improper/no cell found 1', () => {
      a1.setInput('=ref(55)');
      a1.accept(new SetCellValueVisitor());
      expect(a1.getValue().isError()).toEqual(true);
    });
    it('self-referential', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '=ref(A1)');

      expect(sheet.getCellArray()[0][0].getValue().isError()).toEqual(true);

    });
    it('refs addition with improper ref', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '2');
      sheet.updateSheet(1, 0, '=ref(A1)+ref(A52)');

      expect(sheet.getCellArray()[1][0].getValue().isError()).toEqual(true);
    });
    it('refs with all numbers', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '2');
      sheet.updateSheet(1, 0, '3');
      sheet.updateSheet(2, 0, '3');
      sheet.updateSheet(3, 0, '3');
      sheet.updateSheet(4, 0, '=ref(A1)+ref(A2)');

      expect(sheet.getCellArray()[4][0].getValue().valueToString()).toEqual('5');

    });
    it('refs with numbers and empty', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '2');
      sheet.updateSheet(4, 0, '=ref(A1)+ref(A2)');

      expect(sheet.getCellArray()[4][0].getValue().valueToString()).toEqual('2');

    });
    it('refs with invalid format in operation', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, '3');
      sheet.updateSheet(1, 0, '2');
      sheet.updateSheet(2, 0, '=3+avg(A1,A2)');

      expect(sheet.getCellArray()[2][0].getValue().isError()).toEqual(true);

    });
    it('refs with all strings', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, 'daniel');
      sheet.updateSheet(1, 0, 'han');
      sheet.updateSheet(2, 0, '=ref(A1)+ref(A2)');

      expect(sheet.getCellArray()[2][0].getValue().valueToString()).toEqual('danielhan');

    });
    it('refs with all strings and parens', () => {
      resetSpreadSheet();
      sheet.initializeCellArray();
      sheet.updateSheet(0, 0, 'daniel');
      sheet.updateSheet(1, 0, 'han');
      sheet.updateSheet(2, 0, '=ref(A1)+(ref(A2))');

      expect(sheet.getCellArray()[2][0].getValue().isError()).toEqual(true);

    });
    
  });

  describe('illegal arguments after equals', () => {
    it('attempted string', () => {
      a1.setInput('=dan');
      a1.accept(new SetCellValueVisitor());
      expect(a1.getValue().isError()).toEqual(true);
    });
    it('attempted float', () => {
      a1.setInput('=1..40');
      a1.accept(new SetCellValueVisitor());
      expect(a1.getValue().isError()).toEqual(true);
    });
    it('attempted ref', () => {
      a1.setInput('=A1');
      a1.accept(new SetCellValueVisitor());
      expect(a1.getValue().isError()).toEqual(true);
    });
  });
});

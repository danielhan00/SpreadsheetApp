import { Cell } from '../backend/Cell/Cell';
import { IValue } from '../backend/Values/IValue';
import { VString } from '../backend/Values/VString';
import { VEmpty } from '../backend/Values/VEmpty';
import { VNum } from '../backend/Values/VNum';

describe('Cell', () => {
  describe('constructor', () => {
    it('initializing an empty cell', () => {
      const validEmptyCell: Cell = new Cell();
      expect(validEmptyCell.getColor()).toEqual('#ffffff');
      expect(validEmptyCell.getInput()).toEqual('');
      expect(validEmptyCell.getValue()).toEqual(new VEmpty());
    });

    it('setting/getting a cell', () => {
      const cell: Cell = new Cell();
      const val1: IValue = new VString('1');
      const val2: IValue = new VNum(2);
      const val3: IValue = new VNum(4);
      const valEmpty: IValue = new VEmpty();

      // set color
      cell.setColor('#ffggff');
      expect(cell.getColor()).toEqual('#ffggff');

      // set value
      cell.setValue(val1);
      expect(cell.getValue()).toEqual({ value: '1' });

      cell.setValue(val2);
      expect(cell.getValue()).toEqual({ value: 2 });

      cell.setValue(valEmpty);
      expect(cell.getValue()).toEqual({ value: '' });

      // set input
      cell.setInput('sample input');
      expect(cell.getInput()).toEqual('sample input');

      cell.setInput('');
      expect(cell.getInput()).toEqual('');

      cell.setInput('2');
      expect(cell.getInput()).toEqual('2');

      // clearCellTest
      cell.clearCell();
      expect(cell.getInput()).toEqual('');
      expect(cell.getValue()).toEqual(new VEmpty());

      // get ID()

      expect(cell.getID().length).toEqual(36);
      expect(new Cell().getID()).not.toEqual(new Cell().getID());

      // // parseCellValue tests:

      // // Primitive Tests
      // cell.setValue(val1);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual("1");

      // cell.setValue(val2);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(2);

      // cell.setValue(valEmpty);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual('');

      // // Operation Tests
      // const divideVal: IValue = new ODivide(val2, val2);
      // cell.setValue(divideVal);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(1);

      // const divideVal2: IValue = new ODivide(val3, val2);
      // cell.setValue(divideVal2);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(2);

      // const multVal: IValue = new OMultiply(val2, val2)
      // cell.setValue(multVal);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(4);

      // const minVal: IValue = new OMinus(val2, val2)
      // cell.setValue(minVal);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(0);

      // const plusVal: IValue = new OPlus(val2, val2)
      // cell.setValue(plusVal);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(4);

      // // Formula Tests
      // const avgVal: IValue = new FAverage([val2, val3]);
      // cell.setValue(avgVal);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(3);

      // const fsumVal: IValue = new FSum([val2, val3])
      // cell.setValue(fsumVal);
      // cell.parseCellValue();
      // expect(cell.getValue()).toEqual(6);
    });
  });
});

import { VEmpty } from '../backend/Values/VEmpty';
import { VError } from '../backend/Values/VError';
import { VNum } from '../backend/Values/VNum';
import { VString } from '../backend/Values/VString';

describe('IValue', () => {
  describe('constructor', () => {
    it('initializing a VString', () => {
      let str: VString = new VString('');

      // to test the getters and setter of a PString
      expect(str.getValue()).toEqual('');

      str.setValue('beepBopBoop');
      expect(str.getValue()).toEqual('beepBopBoop');

      str.setValue(':::::12222');
      expect(str.getValue()).toEqual(':::::12222');

      // to test compute() on a PString
      expect(str.compute()).toEqual(':::::12222');

      str.setValue('miow');
      expect(str.compute()).toEqual('miow');

      str.setValue('');
      expect(str.compute()).toEqual('');
      expect(str.compute()).not.toEqual('miow');
      expect(str.getValue()).toEqual('');

      // to test typeOf
      let str2: VString = new VString('');

      expect(str.getCopy()).toEqual(str2);

      let num: VNum = new VNum(2);
      expect(str.getCopy()).not.toEqual(num);

      let str3: VString = new VString('11');
      expect(str2.getCopy()).not.toEqual(str3);
    });

    it('initializing a VNum', () => {
      let num: VNum = new VNum(0);

      // to test the setters and getters of a PNum
      expect(num.getValue()).toEqual(0);

      num.setValue(123);
      expect(num.getValue()).toEqual(123);

      // testing compute method of PNum
      expect(num.compute()).toEqual('123');
      num.setValue(999);

      expect(num.getValue()).not.toEqual(123);

      expect(num.getValue()).toEqual(999);
      expect(num.compute()).toEqual('999');

      // to test typeOf
      let num2: VNum = new VNum(2);
      num.setValue(2);

      expect(num.getCopy()).toEqual(num2);
    });

    it('initializing a PEmpty', () => {
      let empty: VEmpty = new VEmpty();

      // to test the getters
      expect(empty.getValue()).toEqual('');
      expect(empty.getValue()).toEqual('');
      expect(empty.getValue()).not.toEqual('loerkeor');

      // to test the compute
      expect(empty.valueToString()).toEqual('');
      expect(empty.valueToString()).not.toEqual(
        'rierijereireireireirjeirerjeireir'
      );

      // to test the typeOf
      let empty2: VEmpty = new VEmpty();
      expect(empty.getCopy()).toEqual(empty2);
    });
  });
});

describe('IValue tests', () => {
  describe('VEmpty Tests', () => {
    it('initializing an VEmpty object', () => {
      const emptyVal = new VEmpty();
      expect(emptyVal.getValue()).toEqual('');
      expect(emptyVal.valueToString()).toEqual('');
      expect(emptyVal.getCopy().valueToString()).toEqual('');
      expect(emptyVal.isNumber()).toEqual(false);
      expect(emptyVal.isEmpty()).toEqual(true);
      expect(emptyVal.isString()).toEqual(false);
      expect(emptyVal.isError()).toEqual(false);
    });
  });

  describe('VError Tests', () => {
    it('initializing an VError object', () => {
      const errorVal = new VError('test');
      expect(errorVal.valueToString()).toEqual('test');
      expect(errorVal.getCopy().valueToString()).toEqual('test');
      expect(errorVal.isNumber()).toEqual(false);
      expect(errorVal.isEmpty()).toEqual(false);
      expect(errorVal.isString()).toEqual(false);
      expect(errorVal.isError()).toEqual(true);
    });
  });

  describe('VNum Tests', () => {
    it('initializing a VNum object', () => {
      const numVal = new VNum(100);
      expect(numVal.valueToString()).toEqual('100');
      expect(numVal.compute()).toEqual('100');
      expect(numVal.getCopy().valueToString()).toEqual('100');
      expect(numVal.isNumber()).toEqual(true);
      expect(numVal.isEmpty()).toEqual(false);
      expect(numVal.isString()).toEqual(false);
      expect(numVal.isError()).toEqual(false);
    });

    it('setting values a VNum object', () => {
      const numVal = new VNum(123);
      expect(numVal.valueToString()).toEqual('123');
      expect(numVal.getCopy().valueToString()).toEqual('123');
      numVal.setValue(56);
      expect(numVal.valueToString()).toEqual('56');
      expect(numVal.getCopy().valueToString()).toEqual('56');
    });
  });

  describe('VString Tests', () => {
    it('initializing a VString object', () => {
      const stringVal = new VString('helloWorld');
      expect(stringVal.valueToString()).toEqual('helloWorld');
      expect(stringVal.compute()).toEqual('helloWorld');
      expect(stringVal.getCopy().valueToString()).toEqual('helloWorld');
      expect(stringVal.isNumber()).toEqual(false);
      expect(stringVal.isEmpty()).toEqual(false);
      expect(stringVal.isString()).toEqual(true);
      expect(stringVal.isError()).toEqual(false);
    });

    it('setting values of a VString object', () => {
      const stringVal = new VString('cs4530');
      expect(stringVal.valueToString()).toEqual('cs4530');
      expect(stringVal.getCopy().valueToString()).toEqual('cs4530');
      expect(stringVal.compute()).toEqual('cs4530');
      stringVal.setValue('cs3500');
      expect(stringVal.valueToString()).toEqual('cs3500');
      expect(stringVal.getCopy().valueToString()).toEqual('cs3500');
      expect(stringVal.compute()).toEqual('cs3500');
    });
  });
});

import { Cell } from "../backend/Cell/Cell";
import Utils from "../backend/Utils/Utils";

describe('Utils tests', () => {
    describe('getLettersOnly tests', () => {
        it('empty string', () => {
            const text = '';
            expect(Utils.getLettersOnly(text)).toEqual('');
        });

        it('string with letters only', () => {
            const text = 'abcd';
            expect(Utils.getLettersOnly(text)).toEqual('abcd');
        });

        it('string with numbers only', () => {
            const text = '5729';
            expect(Utils.getLettersOnly(text)).toEqual('');
        });

        it('string with letters and numbers', () => {
            const text = 'dfhs234bhj';
            expect(Utils.getLettersOnly(text)).toEqual('dfhsbhj');
        });
    })

    describe('getDigitsOnly tests', () => {
        it('empty string', () => {
            const text = '';
            expect(Utils.getDigitsOnly(text)).toEqual('');
        });

        it('string with letters only', () => {
            const text = 'abcd';
            expect(Utils.getDigitsOnly(text)).toEqual('');
        });

        it('string with numbers only', () => {
            const text = '5729';
            expect(Utils.getDigitsOnly(text)).toEqual('5729');
        });

        it('string with letters and numbers', () => {
            const text = 'dfhs234bhj';
            expect(Utils.getDigitsOnly(text)).toEqual('234');
        });
    })

    describe('isNumeric tests', () => {
        it('empty string', () => {
            const text = '';
            expect(Utils.isNumeric(text)).toEqual(true);
        });

        it('string with letters only', () => {
            const text = 'abcd';
            expect(Utils.isNumeric(text)).toEqual(false);
        });
        
        it('string with numbers only', () => {
            const text = '5729';
            expect(Utils.isNumeric(text)).toEqual(true);
        });

        it('string with letters and numbers', () => {
            const text = 'dfhs234bhj';
            expect(Utils.isNumeric(text)).toEqual(false);
        });

        it('number', () => {
            const num = 123;
            expect(Utils.isNumeric(num)).toEqual(true);
        });

        it('float', () => {
            const float = 123.00;
            expect(Utils.isNumeric(float)).toEqual(true);
        });

        it('null type', () => {
            const num = null;
            expect(Utils.isNumeric(num)).toEqual(true);
        });
    })

    describe('colToIndex tests', () => {
        it('empty string', () => {
            const col = '';
            expect(Utils.colToIndex(col)).toEqual(-1);
        });

        it('A char', () => {
            const col = 'A';
            expect(Utils.colToIndex(col)).toEqual(0);
        });

        it('D char', () => {
            const col = 'D';
            expect(Utils.colToIndex(col)).toEqual(3);
        });

        it('Z char', () => {
            const col = 'Z';
            expect(Utils.colToIndex(col)).toEqual(25);
        });

        it('AA char', () => {
            const col = 'AA';
            expect(Utils.colToIndex(col)).toEqual(26);
        });

        it('ALM char', () => {
            const col = 'ALM';
            expect(Utils.colToIndex(col)).toEqual(1000);
        });
    })

    describe('isBalancedParenthesis tests', () => {

        // Empty string = true? 
        it('empty string', () => {
            const text = '';
            expect(Utils.isBalancedParenthesis(text)).toEqual(true);
        });

        it('correct format', () => {
            const text = '=(3)';
            expect(Utils.isBalancedParenthesis(text)).toEqual(true);
        });

        it('correct format', () => {
            const text = '=("hello")';
            expect(Utils.isBalancedParenthesis(text)).toEqual(true);
        });

        it('incorrect format', () => {
            const text = '=(3(';
            expect(Utils.isBalancedParenthesis(text)).toEqual(false);
        });

        it('incorrect format', () => {
            const text = '=)3)';
            expect(Utils.isBalancedParenthesis(text)).toEqual(false);
        });

        it('incorrect format', () => {
            const text = '=)3(';
            expect(Utils.isBalancedParenthesis(text)).toEqual(false);
        });
    })

    describe('numberToCol tests', () => {

        // Empty string = true? 
        it('for 0', () => {
            expect(Utils.indexToCol(0)).toEqual("A");
        });

        it('for 1', () => {
            expect(Utils.indexToCol(1)).toEqual("B");
        });

        it('for 25', () => {
            expect(Utils.indexToCol(25)).toEqual("Z");
        });

        it('for 26', () => {
            expect(Utils.indexToCol(26)).toEqual("AA");
        });

        it('for 26', () => {
            expect(Utils.indexToCol(1000)).toEqual("ALM");
        });
        
    })

})
import React, { useState, useEffect } from 'react';

//backend
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';
import { Cell } from '../backend/Cell/Cell';
import Utils from '../backend/Utils/Utils';

const spreadsheet = SimpleSpreadSheet.getInstance();

/* Props required by InputFieldComponent */
interface Props {
  currCellInput: any;
  currCellPos: any;
  selectedCells: Cell[];
  cellArray: Cell[][];
  updateCurrCellInput: (input: string) => void;
  isTypingInInputBar: React.Dispatch<React.SetStateAction<boolean>>;
}

/* UploadFileComponent: represents a component for the main input field used for typing formulas */
const InputFieldComponent: React.FC<Props> = ({
  currCellInput,
  currCellPos,
  updateCurrCellInput,
  selectedCells,
  cellArray,
  isTypingInInputBar: setIsTypingInInputBar,
}) => {
  const [display, setDisplay] = useState('');

  //Watches for any updates on the input and displays it on screen
  useEffect(() => {
    setDisplay(currCellInput);
  }, [currCellInput]);

  //Watches for user's key strokes and updates the input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTypingInInputBar(true);
    let input = e.target.value;
    updateCurrCellInput(input);
  };

  //Watches for when the input is no longer is focus, indiciating that the user stopped typing
  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTypingInInputBar(false);
    e.preventDefault();
  };

  //Watches for an "enter" key stroke, indicating that the user has stopped typing
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLElement).blur();
    }
  };

  //Renders the positions of the current/selected cells
  const renderCellPos = () => {
    if (selectedCells.length == 0) {
      return (
        <div>{`Cell: (${Utils.indexToCol(currCellPos.col)}${
          currCellPos.row + 1
        })`}</div>
      );
    } else {
      let label = 'Cells: ';
      selectedCells.forEach((cell) => {
        for (let row = 0; row < cellArray.length - 1; row++) {
          let col = cellArray[row].indexOf(cell);
          if (col != -1) {
            label = label.concat(` (${Utils.indexToCol(col)}${row + 1})`);
          }
        }
      });

      return <div>{label}</div>;
    }
  };
  //Renders the input field
  return (
    <>
      <input
        autoFocus
        className='input is-normal'
        placeholder='f(x)'
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyUp={handleKeyUp}
      />
      {renderCellPos()}
    </>
  );
};

export default InputFieldComponent;

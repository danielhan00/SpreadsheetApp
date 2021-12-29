//modules
import React, { useState, useEffect } from 'react';

//backend
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';
import { Cell } from '../backend/Cell/Cell';

const spreadsheet = SimpleSpreadSheet.getInstance();

/* Props required by CellComponent */
interface Props {
  input: string;
  value: string;
  row: number;
  col: number;
  color: string;
  isError: boolean;
  currSheetInput: string;
  currSheetRow: number;
  currSheetCol: number;
  currSheetColor: string;
  selectedCells: Cell[];
  isTypingInInputBar: boolean;
  updateCurrCellInput: (input: string) => void;
  updateCurrCellPos: (row: number, col: number) => void;
  toggleSelectedCells: (row: number, col: number) => void;
  setCurrSheetColor: React.Dispatch<React.SetStateAction<string>>;
  setTriggerRender: React.Dispatch<React.SetStateAction<number>>;
}

/* CellComponent: represents a cell on the spreadsheet */
const CellComponent: React.FC<Props> = ({
  input,
  value,
  row,
  col,
  color,
  isError,
  currSheetInput,
  currSheetRow,
  currSheetCol,
  currSheetColor,
  selectedCells,
  setCurrSheetColor,
  isTypingInInputBar,
  updateCurrCellInput,
  updateCurrCellPos,
  toggleSelectedCells,
  setTriggerRender,
}) => {
  const [cellInput, setCellInput] = useState(input);
  const [cellValue, setCellValue] = useState(value);
  const [cellIsError, setCellIsError] = useState(isError);
  const [display, setDisplay] = useState(value);
  const [isSelected, setIsSelected] = useState(false);
  const [cellColor, setCellColor] = useState(color);
  const [isFocus, setIsFocus] = useState(false);
  const [showErrorTooltip, setShowErrorTooltip] = useState(false);

  //Watches for the "current" cell position and applies cell modifications to the cell
  useEffect(() => {
    if (isCurrCell() && selectedCells.length == 0) {
      setCurrSheetColor(cellColor);
    }
  }, [currSheetRow, currSheetCol]);

  //Watches changes on the selectedCells list and updates the selected status of a cell accordingly
  useEffect(() => {
    let cell = spreadsheet.getCellArray()[row][col];

    if (selectedCells.length == 0) {
      setIsSelected(false);
    } else if (selectedCells.includes(cell)) {
      setIsSelected(true);
    }

    setTriggerRender((prevState) => prevState + 1);
  }, [selectedCells]);

  //Watches for input changes and updates the cell
  useEffect(() => {
    if (isSelected) {
      setDisplay(currSheetInput);
      setCellInput(currSheetInput);
    } else if (isCurrCell() && selectedCells.length == 0) {
      setIsFocus(true);
      setDisplay(currSheetInput);
      setCellInput(currSheetInput);
      updateCurrCellInput(currSheetInput);
    }
  }, [currSheetInput]);

  //Watches for changes on the picked colors and updates the cell
  useEffect(() => {
    if (isSelected) {
      setCellColor(currSheetColor);
      spreadsheet.getCellArray()[row][col].setColor(currSheetColor);
      setTriggerRender((prevState) => prevState + 1);
    } else if (isCurrCell()) {
      setCellColor(currSheetColor);
      spreadsheet.getCellArray()[row][col].setColor(currSheetColor);
      setTriggerRender((prevState) => prevState + 1);
    }
  }, [currSheetColor]);

  //Watches for changes on the typed input field and computes the value of the cells
  useEffect(() => {
    if (isSelected) {
      if (!isTypingInInputBar) {
        updateInputAndValue();
      }
    } else if (isCurrCell()) {
      setIsFocus(isTypingInInputBar);

      if (!isTypingInInputBar) {
        updateInputAndValue();
      }
    }
  }, [isTypingInInputBar]);

  //Watches for whether the cell is in focus and displays the input or value accordingly
  useEffect(() => {
    const value = spreadsheet.getCellArray()[row][col].getValue();

    if (value.isError()) {
      setDisplay('#ERROR');
      setShowErrorTooltip(true);
    }

    if (isSelected) {
      setDisplay(cellValue);
      setShowErrorTooltip(value.isError());
    } else if (isCurrCell()) {
      if (!isFocus && !value.isError()) {
        setDisplay(cellValue);
      } else if (isFocus) {
        setShowErrorTooltip(false);
        setDisplay(cellInput);
      }
    }
  }, [isFocus]);
  const isCurrCell = () => {
    return currSheetRow === row && currSheetCol === col;
  };

  //Updates the user input based on user key strokes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFocus(true);
    let userInput = e.target.value;
    setDisplay(userInput);
    setCellInput(userInput);
    updateCurrCellInput(userInput);
  };

  //Handles when the cell is in focus and updates the cell attributes
  const handleFocus = () => {
    setIsFocus(true);
    setDisplay(cellInput);
    updateCurrCellInput(cellInput);
    updateCurrCellPos(row, col);
  };

  //Handles when the cell is out of focus and updates the cells accordingly
  const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFocus(false);
    updateInputAndValue();
  };

  //Watches for an "enter" key stroke and computes the value
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
  };

  //Helper to modifiy the cell array with the new cell input and re-renders
  const updateInputAndValue = () => {
    spreadsheet.updateSheet(row, col, cellInput);
    const value = spreadsheet.getCellArray()[row][col].getValue();
    setCellValue(value.valueToString());
    setCellIsError(value.isError());
    setTriggerRender((prevState) => prevState + 1);
  };

  //clears the contents and value of the cell
  const clearCell = () => {
    spreadsheet.clearCellinSheet(row, col);
    setCellInput('');
    updateCurrCellInput('');
    setCellValue('');
    setDisplay('');
    setCellIsError(false);
    setTriggerRender((prevState) => prevState + 1);
  };

  //Selects and de-selects a cell
  const toggleSelect = () => {
    setIsSelected((prevState) => !prevState);
    toggleSelectedCells(row, col);
  };

  //Renders a single cell with attached event handlers
  return (
    <td
      className={`tooltip cell ${
        isCurrCell() && isFocus && selectedCells.length == 0
          ? 'cell-current'
          : ''
      }
      ${isCurrCell() && !isFocus ? 'cell-not-focus' : ''}
       ${isSelected ? 'cell-selected' : ''}
       ${display == '#ERROR' ? 'cell-error' : ''}
       `}
      onMouseOver={() => {
        cellIsError ? setShowErrorTooltip(true) : setShowErrorTooltip(false);
      }}
      onMouseOut={() => {
        setShowErrorTooltip(false);
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSelect();
      }}
      style={{ background: cellColor }}
      // onClick={(e) => e.preventDefault()}
    >
      <div className='input-container'>
        <input
          className='cell-input'
          value={display}
          onFocus={handleFocus}
          onBlur={(e) => handleBlur(e)}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          style={{ background: cellColor }}
          disabled={selectedCells.length > 0}
        />
        {cellInput != '' && isCurrCell() && selectedCells.length == 0 && (
          <button
            className='clear-btn button is-warning is-light is-small'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearCell();
            }}
          >
            x
          </button>
        )}
      </div>
      {showErrorTooltip && <span className='tooltiptext'>{cellValue}</span>}
    </td>
  );
};

export default CellComponent;

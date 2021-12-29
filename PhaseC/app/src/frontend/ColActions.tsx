import React from 'react';

//backend
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';
import { Cell } from '../backend/Cell/Cell';

const spreadsheet = SimpleSpreadSheet.getInstance();

/* Props required by ColActions */
interface Props {
  colIdx: number;
  currCellPos: { row: number; col: number };
  setCurrCellPos: React.Dispatch<
    React.SetStateAction<{ row: number; col: number }>
  >;
  setTriggerRender: React.Dispatch<React.SetStateAction<number>>;
  cellArray: Cell[][];
}

/* ColActions: a dropdown menu of row actions used by users */
const ColActions: React.FC<Props> = ({
  colIdx,
  currCellPos,
  setCurrCellPos,
  setTriggerRender,
  cellArray,
}) => {
    //renders dropdown components with attached event handlers
  return (
    <select
      className='col-action'
      onChange={(e) => {
        switch (e.target.value) {
          case 'add-left':
            try {
              spreadsheet.addCol(colIdx);
              setCurrCellPos({ row: currCellPos.row, col: colIdx + 1 });
              setTriggerRender((prevState) => prevState + 1);
            } catch (err) {
              alert(err);
            }
            break;
          case 'add-right':
            try {
              spreadsheet.addCol(colIdx + 1);
              setCurrCellPos({ row: currCellPos.row, col: colIdx + 2 });
              setTriggerRender((prevState) => prevState + 1);
            } catch (err) {
              alert(err);
            }
            break;
          case 'clear':
            for (let row = 0; row < cellArray.length - 1; row++) {
              spreadsheet.clearCellinSheet(row, colIdx);
            }
            setTriggerRender((prevState) => prevState + 1);
            break;
          case 'delete':
            try {
              spreadsheet.deleteCol(colIdx);
              setCurrCellPos({ row: currCellPos.row, col: colIdx });
            } catch (err) {
              alert(err);
            }
            setTriggerRender((prevState) => prevState + 1);
            break;
        }
        e.target.value = 'default';
      }}
    >
      <option></option>
      <option value='add-left'>Add Column to Left</option>
      <option value='add-right'>Add Column to Right</option>
      <option disabled={true}>──────────</option>
      <option value='clear'>Clear Column</option>
      <option value='delete'>Delete Column</option>
    </select>
  );
};

export default ColActions;

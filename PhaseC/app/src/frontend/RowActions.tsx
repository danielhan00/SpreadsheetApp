import React from 'react';

//backend
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';
import { Cell } from '../backend/Cell/Cell';

const spreadsheet = SimpleSpreadSheet.getInstance();

/* Props required by RowActions */
interface Props {
  rowIdx: number;
  currCellPos: { row: number; col: number };
  setCurrCellPos: React.Dispatch<
    React.SetStateAction<{ row: number; col: number }>
  >;
  setTriggerRender: React.Dispatch<React.SetStateAction<number>>;
  cellArray: Cell[][];
}

/* RowActions: a dropdown menu of row actions used by users */
const RowActions: React.FC<Props> = ({
  rowIdx,
  currCellPos,
  setCurrCellPos,
  setTriggerRender,
  cellArray,
}) => {
  //renders dropdown components with attached event handlers
  return (
    <select
      className='row-action'
      onChange={(e) => {
        switch (e.target.value) {
          case 'add-above':
            try {
              spreadsheet.addRow(rowIdx);
              setCurrCellPos({ row: rowIdx + 1, col: currCellPos.col });
              setTriggerRender((prevState) => prevState + 1);
            } catch (err) {
              alert(err);
            }
            break;
          case 'add-below':
            try {
              spreadsheet.addRow(rowIdx + 1);
              setCurrCellPos({ row: rowIdx + 2, col: currCellPos.col });
              setTriggerRender((prevState) => prevState + 1);
            } catch (err) {
              alert(err);
            }
            break;
          case 'clear':
            for (let col = 0; col < cellArray[rowIdx].length - 1; col++) {
              spreadsheet.clearCellinSheet(rowIdx, col);
            }
            setTriggerRender((prevState) => prevState + 1);
            break;
          case 'delete':
            try {
              spreadsheet.deleteRow(rowIdx);
              setCurrCellPos({ row: rowIdx, col: currCellPos.col });
            } catch (err) {
              alert(err);
            }
            setTriggerRender((prevState) => prevState + 1);
            break;
        }

        e.target.value= 'default';
      }}
    >
      <option value='default'></option>
      <option value='add-above'>Add Row Above</option>
      <option value='add-below'>Add Row Below</option>
      <option disabled={true}>──────────</option>
      <option value='clear'>Clear Row</option>
      <option value='delete'>Delete Row</option>
    </select>
  );
};

export default RowActions;

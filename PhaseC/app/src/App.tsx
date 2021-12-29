//modules
import React, { useState, useEffect } from 'react';
import { SwatchesPicker } from 'react-color';

//backend
import { SimpleSpreadSheet } from './backend/SpreadSheet/SimpleSpreadSheet';
import { Cell } from './backend/Cell/Cell';
import Utils from './backend/Utils/Utils';

//frontend
import InputFieldComponent from './frontend/InputFieldComponent';
import CellComponent from './frontend/CellComponent';
import UploadFileComponent from './frontend/UploadFileComponent';
import ExportFileComponent from './frontend/ExportFileComponent';
import RowActions from './frontend/RowActions';
import ColActions from './frontend/ColActions';
import { colors } from './frontend/colors';
import './index.css';

const spreadsheet = SimpleSpreadSheet.getInstance();
spreadsheet.initializeCellArray();

/* App compnent: parent component entry point for React app*/
const App: React.FC = () => {
  const [title, setTitle] = useState(spreadsheet.getTitle());
  const [cellArray, setCellArray] = useState(spreadsheet.getCellArray());
  const [currCellInput, setCurrCellInput] = useState(
    cellArray[0][0].getInput()
  );
  const [currCellPos, setCurrCellPos] = useState({ row: 0, col: 0 });
  const [currCellColor, setCurrCellColor] = useState(
    cellArray[0][0].getColor()
  );
  const [selectedCells, setSelectedCells] = useState<any>([]);
  const [isTypingInInputBar, setIsTypingInInputBar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [triggerRender, setTriggerRender] = useState(0);

  //Sets the input currently typed out by the user
  const updateCurrCellInput = (input: string) => {
    setCurrCellInput(input);
  };

  //Updates the position of the "current" cell based on the user's selection
  const updateCurrCellPos = (row: number, col: number) => {
    setCurrCellPos({ row: row, col: col });
  };

  //Watches for array changes and re-renders the spreadsheet
  useEffect(() => {
    setCellArray(spreadsheet.getCellArray());
  }, [triggerRender]);

  //Selects and de-selects cells
  const toggleSelectedCells = (sRow: number, sCol: number) => {
    let cell = cellArray[sRow][sCol];

    setSelectedCells(
      selectedCells.includes(cell)
        ? selectedCells.filter((c: Cell) => c !== cell)
        : selectedCells.concat(cell)
    );
  };

  //Renders the spreadsheet's column headers based on the cell array
  const renderColLabels = () => {
    return cellArray[0].map((cell: Cell, colIdx) => {
      let label = (
        <th key={'c' + cell.getID()} className='col-label'>
          <span>{Utils.indexToCol(colIdx)}</span>
          <ColActions
            colIdx={colIdx}
            currCellPos={currCellPos}
            setCurrCellPos={setCurrCellPos}
            setTriggerRender={setTriggerRender}
            cellArray={cellArray}
          />
        </th>
      );
      return label;
    });
  };

  //Renders the spreadsheet's rows based on the cell array
  const renderRows = () => {
    return cellArray.map((row: Cell[], rowIdx: number) => {
      let cell = row.map((cell: Cell, colIdx: number) => (
        //key: triggers a re-render anytime these change
        <CellComponent
          key={cell.getInput() + cell.getValue().valueToString() + cell.getID()}
          input={cell.getInput()}
          value={cell.getValue().valueToString()}
          row={rowIdx}
          col={colIdx}
          color={cell.getColor()}
          isError={cell.getValue().isError()}
          isTypingInInputBar={isTypingInInputBar}
          currSheetInput={currCellInput}
          currSheetRow={currCellPos.row}
          currSheetCol={currCellPos.col}
          currSheetColor={currCellColor}
          selectedCells={selectedCells}
          setCurrSheetColor={setCurrCellColor}
          updateCurrCellInput={updateCurrCellInput}
          updateCurrCellPos={updateCurrCellPos}
          toggleSelectedCells={toggleSelectedCells}
          setTriggerRender={setTriggerRender}
        />
      ));
      return (
        <tr key={rowIdx}>
          <th className='row-label'>
            {rowIdx + 1}
            <RowActions
              rowIdx={rowIdx}
              currCellPos={currCellPos}
              setCurrCellPos={setCurrCellPos}
              setTriggerRender={setTriggerRender}
              cellArray={cellArray}
            />
          </th>
          {cell}
        </tr>
      );
    });
  };

  //renders the menu options for selected cells
  const renderSelectedMenu = () => {
    return (
      <>
        <button
          className='button is-info is-light'
          onClick={() => {
            selectedCells.forEach((cell: Cell) => {
              for (let rowInd = 0; rowInd < cellArray.length - 1; rowInd++) {
                let colInd = cellArray[rowInd].indexOf(cell);
                if (colInd != -1) {
                  spreadsheet.clearCellinSheet(rowInd, colInd);
                }
              }
            });
            setCurrCellInput('');
            setTriggerRender((prevState) => prevState + 1);
          }}
        >
          Clear Selected Cells
        </button>
        <button
          className='button is-success is-light'
          onClick={() => setSelectedCells([])}
        >
          Deselect Cells
        </button>
      </>
    );
  };

  //renders all app components
  return (
    <>
      <header>
        <input
          type='text'
          id='title'
          className='title is-4'
          placeholder='Untitled Spreadsheet'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className='menu'>
          <div className='cell-menu'>
            <h4 className='title is-6'>Edit Cell</h4>
            <InputFieldComponent
              currCellInput={currCellInput}
              currCellPos={currCellPos}
              updateCurrCellInput={updateCurrCellInput}
              selectedCells={selectedCells}
              cellArray={cellArray}
              isTypingInInputBar={setIsTypingInInputBar}
            />
          </div>
          <div className='csv-menu'>
            <h4 className='title is-6'>Import and Export</h4>
            <div>
              <UploadFileComponent
                setSpreadSheetTitle={setTitle}
                currCellPos={currCellPos}
                updateCurrCellInput={updateCurrCellInput}
                setTriggerRender={setTriggerRender}
              />
              <ExportFileComponent spreadSheetTitle={title} />
            </div>
          </div>
        </div>
        <div className='menu'>
          <div className='cell-menu'>
            <button
              className='button is-info'
              onClick={() => setShowColorPicker((prevState) => !prevState)}
            >
              Edit Color
            </button>
            {showColorPicker && (
              <SwatchesPicker
                height={125}
                color={currCellColor}
                onChange={(color) => {
                  setCurrCellColor(color.hex);
                  setShowColorPicker(false);
                }}
                colors={colors}
              />
            )}
            {selectedCells.length !== 0 ? renderSelectedMenu() : null}
          </div>
        </div>
      </header>
      <main>
        <table>
          <thead>
            <tr>
              <th></th>
              {renderColLabels()}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </main>
    </>
  );
};

export default App;

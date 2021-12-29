//modules
import React, { Dispatch, SetStateAction } from 'react';

//backend
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';

const spreadsheet = SimpleSpreadSheet.getInstance();

/* Props required by UploadFileComponent */
interface Props {
  currCellPos: { row: number; col: number };
  setSpreadSheetTitle: React.Dispatch<SetStateAction<string>>;
  updateCurrCellInput: (input: string) => void;
  setTriggerRender: React.Dispatch<React.SetStateAction<number>>;
}

/* UploadFileComponent: represents a component for file upload to accept CSV imports */
const UploadFileComponent: React.FC<Props> = ({
  currCellPos,
  setSpreadSheetTitle,
  updateCurrCellInput,
  setTriggerRender,
}) => {
  let fileReader: FileReader;

  //Watches for a file upload and retrieves the file's  contents
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    var confirmAlert = confirm('This will override the spreadsheet');
    if (confirmAlert == true) {
      fileReader = new FileReader();
      fileReader.onloadend = readFile;
      fileReader.readAsText(e.target.files![0]);

      let csvTitle = e.target.files![0].name;
      setSpreadSheetTitle(csvTitle.substr(0, csvTitle.length - 4));
    } else {
      e.target.value = '';
    }
  };

  //Reads the contents of the file and populates the spreadsheet
  const readFile = () => {
    let content = fileReader.result!.toString();

    try {
      spreadsheet.initializeFromCsvString(content);
    } catch (err) {
      alert(err);
    }

    updateCurrCellInput(
      spreadsheet.getCellArray()[currCellPos.row][currCellPos.col].getInput()
    );
    setTriggerRender((prevState) => prevState + 1);
  };

  //Renders all app components
  return (
    <div className='file is-link'>
      <label className='file-label'>
        <input
          className='file-input'
          type='file'
          accept='.csv, .xlsx'
          onChange={handleChange}
        />
        <span className='file-cta'>
          <i className='fas fa-upload'></i>
          <span className='file-label'>Import CSV</span>
        </span>
      </label>
    </div>
  );
};

export default UploadFileComponent;

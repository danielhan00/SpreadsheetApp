//modules
import React from 'react';

//backend
import { SimpleSpreadSheet } from '../backend/SpreadSheet/SimpleSpreadSheet';

const spreadsheet = SimpleSpreadSheet.getInstance();

/* Props required by ExportFileComponet  */
interface Props {
  spreadSheetTitle: string;
}

/* ExportFileComponent: represents a button that downloads a csv file of the spreadsheet */
const ExportFileComponent: React.FC<Props> = ({ spreadSheetTitle }) => {
  //Watches for a user click and downloads the file
  const handleClick = () => {
    const element = document.createElement('a');
    const file = new Blob([spreadsheet.toCsvString()], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download =
      spreadSheetTitle != '' ? spreadSheetTitle + '.csv' : 'untitled.csv';
    document.body.appendChild(element);
    element.click();
  };
  //Renders the download button
  return (
    <button className='button is-link is-light' onClick={handleClick}>
      Export CSV
    </button>
  );
};

export default ExportFileComponent;

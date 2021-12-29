import { IValue } from '../Values/IValue';
import { VEmpty } from '../Values/VEmpty';
import {IVisitor} from '../Visitor/IVisitor'
import { v4 as uuidv4 } from 'uuid';

/**
 * To represent a single Cell of a Simple SpreadSheet;
 * A Cell has a value, a color, its position on the spreadsheet as a row and col
 */
export class Cell {

  private id: string;
  private input: string;
  private value: IValue;
  private color: string;

  /**
   * To initialize a default Cell
   * with an empty input, value, and white color
   */
  constructor() {
    this.id = uuidv4();
    this.input = '';
    this.value = new VEmpty();
    this.color = '#ffffff';

  }

  // Generic for accepting Visitors
  accept(visitor: IVisitor) {
    visitor.visit(this);
  }
  /**
   * to get the cell input
   *
   * @returns the value of this cell
   */
  getInput(): string {
    return this.input;
  }

  /**
   * to set the cell input
   *
   * @param newInput from the user
   */
  setInput(newInput: string): void {
    this.input = newInput;
  }

  /**
   * to get the cell value
   *
   * @returns the value of this cell
   */
  getValue(): IValue {
    return this.value;
  }

  /**
   * to set a new value to this cell
   *
   * @param newVal to represent the new value of this cell
   */
  setValue(newVal: IValue): void {
    this.value = newVal;
  }

  /**
   * to get the color of this cell
   *
   * @returns the color of this cell
   */
  getColor(): string {
    return this.color;
  }

  /**
   * to set the new color of this cell
   *
   * @param newColor to represent the new color of this cell
   */
  setColor(newColor: string): void {
    this.color = newColor;
  }

  /**
   * to clear the cell
   *
   * @param newColor to represent the new color of this cell
   */
  clearCell(): void {
    this.input = '';
    this.value = new VEmpty();
  }

  /**
   * Gets the id for a cell
   * 
   * @returns a string representing the id of this cell
   */
  getID(): string {
    return this.id;
  }

}

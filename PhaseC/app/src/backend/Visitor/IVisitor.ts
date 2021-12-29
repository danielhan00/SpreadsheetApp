import {Cell} from '../Cell/Cell'

/**
 * to represent the Visitor interface which includes all the functionalities
 * for finding cell references 
 */
export interface IVisitor {

    /**
     * to visit the Cell and find all the references
     * 
     * @param cell to represent the cell that will be visited
     */
    visit(cell: Cell): void;
}
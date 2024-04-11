import { ID, addElem } from "./utils.js";

/**
 * Generic function to make a table editable with in-cell editor
 * @param {*} elem 
 * @param {*} data 
 * @param {*} onEditTableCell 
 */
export const makeTableEditable = (elem, data, onEditTableCell) => {
    ID(elem).innerHTML = data;    
    const editables = ID(elem).querySelectorAll('.editable');

    let input, isClosed = false;

    const closeEditor = (cell) => {        
        if (isClosed) return;
        isClosed = true;
        const val = input.value;
        input.remove();        
        cell.textContent = val;
        onEditTableCell(cell, val);                
    }

    for (const cell of editables) {
        if (cell.parentNode.addEventListener('click', e => { 
            isClosed = false;
            if (cell.children[0]) return;
            const v = cell.textContent; 
            cell.textContent = ''; 
            input = addElem({ parent:cell, tagName:'input', type:'text', value:v });              
            input.focus();
            input.addEventListener('blur', e => { closeEditor(cell); });
            input.addEventListener('keydown', e => { if (e.key == 'Enter') closeEditor(cell); });
        }));
    }
}

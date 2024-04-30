import { makeTableEditable } from "./htmlhelp.js";
import { ID, addElem, addEvent, getJSON } from "./utils.js";

const onEditCustomColorsTableCell = (cell, newValue) => {
    const rowIndex = cell.parentNode.rowIndex;
    const ss       = document.styleSheets[1];
    if (rowIndex == 1) ss.cssRules[6].style.color  = newValue; // name
    if (rowIndex == 2) ss.cssRules[5].style.color  = newValue; // attr                    
    if (rowIndex == 3) ss.cssRules[8].style.color  = newValue; // string
    if (rowIndex == 4) ss.cssRules[3].style.color  = newValue; // comment
}

const getPageInfo = (pages) => {
    let lastVisible = null, firstVisible = null, visiblePages = 0;
    for (const p of pages) {
        if (!p.classList.contains('hidden')) {
            if (firstVisible == null) firstVisible = p;
            lastVisible = p;        
            visiblePages++;
        }
    }
    return { firstVisible, lastVisible, visiblePages };
}

const makePagedWindow = (body, data) => {    
    const linesPerPage = 400;
    let currentPage    = 0;

    body.addEventListener('scrollend', e => {         
        if (body.scrollTop == 0) {            
            const p = getPageInfo(pages);
            if (p.firstVisible != pages[0]) {
                const i = pages.indexOf(p.firstVisible);
                pages[i - 1].classList.remove('hidden');                                        // show previous page
                hljs.highlightElement(pages[i - 1].querySelector('code'));
                if (p.visiblePages == 2) pages[i + 1].classList.add('hidden');                  // hide next page
                body.scrollTo(0, pages[i].scrollHeight - 1);                                    // scroll to bottom of the new visible page
            }            
            return
        }
        if (body.offsetHeight + body.scrollTop >= body.scrollHeight) {
            const p = getPageInfo(pages);
            if (p.lastVisible != pages.at(-1)) {
                const i = pages.indexOf(p.lastVisible);
                pages[i + 1].classList.remove('hidden');                                        // show next page
                hljs.highlightElement(pages[i + 1].querySelector('code'));
                if (p.visiblePages == 2) pages[i - 1].classList.add('hidden');                  // hide previous page
            }
        }
    });

    const lines     = data.split('\n');
    const pageCount = Math.ceil(lines.length / linesPerPage);
    const pages     = [];
        
    for (let i = 0; i < pageCount; i++) {        
        const ofs  = i * linesPerPage;
        const page = addElem({ parent:body, tagName:'pre' });
        const code = addElem({ parent:page, tagName:'code', text:lines.slice(ofs, ofs + linesPerPage).join('\n') });        
        pages.push(page);

        if (i > 0) page.classList.add('hidden');
            else hljs.highlightElement(code);
    }        
}

export class TWindow {
    constructor(parentHTMLElement) {
        this.parent   = ID(parentHTMLElement);
        this.ext      = '';

        const elem    = addElem({ parent:this.parent, tagName:'custom-win' });
        const head    = addElem({ parent:elem, tagName:'div', class:'head' });
        const caption = addElem({ parent:head, tagName:'h2' });
        const btClose = addElem({ parent:head, tagName:'button', class:'bt-close' });
        const body    = addElem({ parent:elem, tagName:'div', class:'body' });

        addEvent(btClose, 'click', e => { win.remove(); });
        
        Object.assign(this, { elem, caption, btClose, head, body });
    }

    get content() {
        return this.body.children[0].children[0].textContent;
    }

    get data() {
        const rows = [];
        if (this.ext == 'tab') {
            const tab = this.body.querySelector('table');
            for (const row of tab.rows) {
                const rowData = [];                
                for (const cell of row.cells) {
                    rowData.push(cell.textContent);
                }
                rows.push(rowData);
            }
        }

        // convert arrays to key-value object:
        if (rows[0][0] == 'Key' && rows[0][1] == 'Value') {
            rows.shift();
            return Object.fromEntries(rows);
        }

        // return array of arrays (table):
        return rows;
    }

    async loadContent(windowData) {        
        const { url } = windowData;
        const { caption, body } = this;
            
        caption.textContent = windowData.caption + (url ? ' (' + url + ')' : '');

        if (url == null) {
            const pre  = addElem({ parent:body, tagName:'pre' });
            const code = addElem({ parent:pre, tagName:'code' });
            return;
        } 

        const data = await fetch(url).then(t => t.text());                          // load contents from file        
        
        if (url.endsWith('.tab')) {
            const pre  = addElem({ parent:body, tagName:'pre' });
            const code = addElem({ parent:pre, tagName:'code' });
            makeTableEditable(code, data, onEditCustomColorsTableCell);
            this.ext = 'tab';
        } 

        if (url.endsWith('.xml')) {         
            makePagedWindow(body, data);
            this.ext = 'xml';
        } 

        if (url.endsWith('.txt')) {         
            const pre  = addElem({ parent:body, tagName:'pre' });
            const code = addElem({ parent:pre, tagName:'code' });
            code.textContent = data;
            this.ext = 'txt';
        }
    }    
}
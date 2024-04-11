import { makeTableEditable } from "./htmlhelp.js";
import { ID, addElem, getJSON } from "./utils.js";

export const onEditCustomColorsTableCell = (cell, newValue) => {
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

const loadContent = async (windowData) => {        
    const { url } = windowData;

    const data = await fetch(url).then(t => t.text());
    const ws   = ID('workspace');
    const win  = addElem({ parent:ws,  tagName:'custom-win' });
    const head = addElem({ parent:win, tagName:'h2' });
    const body = addElem({ parent:win, tagName:'div', class:'body' });

    head.textContent = windowData.caption + ' (' + windowData.url + ')';
    
    if (url.endsWith('.tab')) {
        const pre  = addElem({ parent:body, tagName:'pre' });
        const code = addElem({ parent:pre, tagName:'code' });
        makeTableEditable(code, data, onEditCustomColorsTableCell);
    } 
    if (url.endsWith('.xml')) {         
        makePagedWindow(body, data);
    } 
    if (url.endsWith('.txt')) {         
        const pre  = addElem({ parent:body, tagName:'pre' });
        const code = addElem({ parent:pre, tagName:'code' });
        code.textContent = data;
    }
}

const deactiveWindows = (w) => { w.forEach(f => f.classList.remove('active')); }

const loadEditorWindowContents = async () => {        
    const winData = await getJSON('./system/windows.hjson');
    for (const w of winData) await loadContent(w);
    return ID('workspace').querySelectorAll('custom-win');
}

const main = async () => {
    const iconButtons = document.querySelectorAll('a-icon');            // left bar
    const dialogs     = document.querySelectorAll('dialog');
    
    let i = 0;
    for (const a of iconButtons) {
        const d = dialogs[i++];
        a.addEventListener('click', e => { d.showModal(); });                
    }

    for (const d of dialogs) {
        const btClose = d.querySelector('button');        
        btClose.addEventListener('click', e => { console.log(e); d.close(); });
    }

    const windows = await loadEditorWindowContents();
    for (const w of windows) {
        w.querySelector('h2').addEventListener('dblclick', e => { w.classList.toggle('maximized'); });
        w.addEventListener('click', e => { deactiveWindows(windows); w.classList.add('active'); });
    }
}

main();
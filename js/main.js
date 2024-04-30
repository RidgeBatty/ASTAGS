import { TWindow } from "./twindow.js";
import { ID, addElem, addEvent, getJSON } from "./utils.js";

const deactiveWindows = (w) => { w.forEach(f => f.classList.remove('active')); }

const loadEditorWindowContents = async () => {            
    const winData = await getJSON('./system/windows.hjson');
    const windows = [];
    for (const w of winData) {
        const win = new TWindow('workspace');
        await win.loadContent(w);
        windows.push(win);
    }
    return windows;
}

const updateWindowsMenu = (windows) => {    
    const tabWindows = ID('tab-windows');
    tabWindows.children[1].replaceChildren();       // remove all child elements
    windows.forEach(f => { 
        const text = f.caption.textContent.split('(')[0]; 
        addElem({ parent:tabWindows.children[1], text });
    });
    addEvent(tabWindows, 'click', e => { console.log(e.target.textContent); });
}

const runTokenizer = (windows) => {
    let main, app, sepa;
    for (const w of windows) {        
        if (w.caption.textContent.includes('Input: Main Text')) { main = w }
        if (w.caption.textContent.includes('Input: Apparatus')) { app = w }
        if (w.caption.textContent.includes('Control: Token Separators')) { sepa = w }
    }
    const sd = sepa.data;        
    const se = Object.entries(sd);

    const result = [];

    const internalLexicalAnalysis = (acc) => {                
        if (parseInt(acc) == acc) return 'Number';
        if (parseInt(acc) + 'o' == acc) return 'Ordinal';
        if (/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/.test(acc)) return 'Alphanumeric';         // at least one number and one character
        if (/\p{Script=Greek}/u.test(acc)) return 'Greek';                    
        if (/\p{Script=Latin}/u.test(acc)) {
            if (/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(acc)) return 'Roman numeral'
            return 'Latin';
        }
        if (/\p{Script=Hebrew}/u.test(acc)) return 'Hebrew'; 
    }

    const checkContiguous = () => {
        if (acc != '') {            
            const o = { v:acc };            
            const t = internalLexicalAnalysis(acc);
            if (t) o.t = t;
            result.push(o);
            acc = '';
        }
    }

    const findMatchingSeparator = (ch) => {
        return se.findIndex(f => { 
            if (f[0] == 'Whitespace') return false;
            const re = f[1].length == 1 ? new RegExp('\\' + f[1], 'i') : new RegExp('[\\' + f[1] + ']', 'i'); 
            return re.test(ch); 
        });
    }
    
    let acc = '';
    for (const ch of app.content) {            
        if (ch.trim() == 0) {
            checkContiguous();
            continue;
        }
                
        const fIndex = findMatchingSeparator(ch);             // find matching separator        
        if (fIndex > -1) {                                             
            checkContiguous();
            result.push({ v:ch, s:se[fIndex][0] });
        } else 
            acc += ch;
    }
    checkContiguous();

    console.log(result);

    console.log('Running tokenizer...');
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
        w.head.addEventListener('dblclick', e => { w.classList.toggle('maximized'); });
        w.elem.addEventListener('click', e => { deactiveWindows(windows); w.classList.add('active'); });
    }

    updateWindowsMenu(windows);
    
    addEvent('tab-run', 'click', e => { 
        if (e.target.textContent == 'Run Tokenizer') runTokenizer(windows);
    });
}

main();
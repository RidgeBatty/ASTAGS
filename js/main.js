import { ID } from "./utils.js";

const loadContent = async (elem, url) => {    
    const data = await fetch(url).then(t => t.text());
    ID(elem).textContent = data;    
}

const main = async () => {
    const iconButtons = document.querySelectorAll('a-icon');
    const dialogs     = document.querySelectorAll('dialog');
    const windows     = document.querySelectorAll('custom-win');
    
    let i = 0;
    for (const a of iconButtons) {
        const d = dialogs[i++];
        a.addEventListener('click', e => { d.showModal(); });                
    }

    for (const d of dialogs) {
        const btClose = d.querySelector('button');        
        btClose.addEventListener('click', e => { console.log(e); d.close(); });
    }

    for (const w of windows) {
        w.querySelector('h2').addEventListener('click', () => {
            w.classList.toggle('maximized');
        });
    }

    await loadContent('input-maintext',  './input/gen-maintext.txt');
    await loadContent('input-apparatus', './input/gen-apparatus.txt');
    await loadContent('output-content',  './output/output_gen.xml');
    
    hljs.highlightElement(document.querySelector('code#output-content'));    
}

main();
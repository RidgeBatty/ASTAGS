import { Location } from "./location.js";

let total = 0, fails = 0, errors = 0;

const assert = (code, correctResult) => {   
    total++;
    try { 
        const r = code();
        const result = r == correctResult;
        console.log(result);        
        if (!result) fails++;
    } catch (e) {
        errors++;
        console.log('ERROR!');
    }        
}

const runTest = () => {    
    console.log('-'.repeat(80));
    test();
    console.log('');
    console.log(`Total: ${total} | Failed: ${fails} | Errors: ${errors}`);
    console.log('-'.repeat(80));
}

const test = () => {           
    assert(() => { 
        const a = new Location('B10K05V13W02');        
        return Location.ConvertToString(a.asNumeric);
    }, 'B10K05V13W02');

    assert(() => {
        const b = new Location('Hello!');
        return Location.ConvertToString(b.asNumeric);
    });

    assert(() => {
        const a = new Location('B10K05V13W02');
        const b = new Location('B12K05V13W02');
        const t = new Location('B05K13V02');        
        return t.inRange(a, b);
    }, true);
}

runTest();
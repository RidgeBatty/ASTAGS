const signs = 'BKVW'.split('');

export class Location {
    /**
     * 
     * @param {string} location B01K02V03W04
     */
    constructor(location) {
        let alpha = location.replace(/[0-9]/g, '').split('');
        if (alpha.length > 4) throw 'Too many characters found in location argument';

        for (let i = 0; i < alpha.length; i++) {
            if (!signs.includes(alpha[i])) throw `Invalid character "${alpha[i]}" found in location argument"`;
            if (alpha[i] != signs[i]) throw 'Illegal order of characters in location argument';
            if (isNaN(+location[location.indexOf(alpha[i]) + 1])) throw 'Every character in the location string must be followed by at least one number';
        }

        this.location = location;
    }

    /**
     * Returns current location as an object e.g. { B:1, K:2, V:3, W:4 }
     */
    get asNumeric() {     
        let result = {}, index = -1; 

        for (const ch of this.location) {
            if (isNaN(+ch)) {                                            // current character not coercible to number                
                index = signs.indexOf(ch);                
                if (result[ch] == null) result[ch] = '';                
                continue;                             
            }                       
            result[signs[index]] += ch;                                 // coerced to number
        }      
        Object.keys(result).forEach(k => result[k] = +result[k]);       // convert object values from string --> numeric
        return result;
    }

    /**
     * Converts given location (stored as an object) into a string
     * @param {object} obj location object e.g. { B:1, K:2, V:3, W:4 }
     */
    static ConvertToString(obj) {
        let s = '';
        Object.keys(obj).forEach(k => { s += k; s += (obj[k] + '').padStart(2, '0') });
        return s;
    }

    /**
     * Tests whether the current location is withing the given range
     * @param {Location} start 
     * @param {Location} end 
     * @returns {Boolean}
     */
    inRange(start, end) {
        const s = start.asNumeric;
        const e = end.asNumeric;
        const t = this.asNumeric;
        
        for (const i of signs) if (t[i] == null || e[i] == null || s[i] == null || (t[i] < s[i] || t[i] > e[i])) return false;        
        return true;
    }
}

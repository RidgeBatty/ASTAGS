/*

	Utils
	Tiny Game Engine
	Written by Ridge Batty (c) 2021	
	
*/
export const InputTypes = 'button checkbox color date datetime-local email file hidden image month number password radio range reset search submit tel text time url week'.split(' ');

/**
 * Halts execution of current Javascript context for n milliseconds without blocking other asynchronous tasks.
 * @async
 * @param {number} milliseconds 
 * @returns {Promise}
 */
const delay = async (milliseconds) => { return await new Promise(resolve => { setTimeout(resolve, milliseconds); }); }

/**
 * Preloads a list of image files and returns a promise which resolves when all the images are completely loaded.
 * @async
 * @param {Object} o - Parameter object
 * @param {string=} o.path - Path to files
 * @param {string[]} o.urls - List of URLs
 */
const preloadImages = async (o) => { 	
	return new Promise((resolve, reject) => { 
		let c = 0, i = 0;
		let images = [];
		for (let url of o.urls) {			
			const img = new Image();
			img.onload  = () => { images[parseInt(img.dataset.index, 10)] = img; delete img.dataset.index; c++; if (c == o.urls.length) resolve(images); }
			img.onerror = () => { reject('Error loading image ' + img.src); }
			img.dataset.index = i++;
			img.src = ('path' in o ? o.path : '') + url; 			
		}
	}); 
}

const preloadVideo = async (o) => {	
	const video = document.createElement('video');		
	video.style.display = 'none';
	video.crossOrigin   = 'anonymous'; 
				
	if (o.loop)  	video.loop  = true;
	if (o.muted)    video.muted = true;
	if (o.autoplay) video.autoplay = true;		
	if (o.promise) {
		return new Promise((resolve, reject) => {			
			const mediaSource = new MediaSource();
			video.src = URL.createObjectURL(mediaSource);
			mediaSource.addEventListener('sourceopen', sourceOpen, { once: true });
			mediaSource.addEventListener('sourceended', (e) => { 	
				if (o.parent) o.parent.appendChild(video);														
				resolve(video);
			});

			function sourceOpen(e) {
				URL.revokeObjectURL(video.src);
				const mime         = 'video/webm;codecs=vp9';
				const mediaSource  = e.target;
				const sourceBuffer = mediaSource.addSourceBuffer(mime);
				  
				fetch(o.url)
					.then(r => r.arrayBuffer())
					.then(arrayBuffer => {	
						sourceBuffer.addEventListener('updateend', (e) => {							
							// everything loaded;																
							mediaSource.endOfStream();
					    });						
					    sourceBuffer.appendBuffer(arrayBuffer);
					});
			}			  
		});
	} 
	
	await fetch(o.url)
		 .then(response => response.blob())
		 .then(blob => {			 
			 video.src = URL.createObjectURL(blob);			 			
			 if (o.parent) o.parent.appendChild(video);
		 });
	 
	return video;
}

/*
	Simple shuffle function to randomize the order of elements in given array
*/
const shuffle = (values) => {		
	for (let i = values.length; i--;) {
		let rnd     = Math.floor(Math.random() * i);		
		let tmp     = values[i];
		values[i]   = values[rnd];
		values[rnd] = tmp;		
	}	
}	

/*	
	RayTrace by Actor Type
	Crude and unoptimized raytracing function to check if any actor in provided "actors" collection will collide with the ray.
	Ray is defined by a starting point "position", direction "angle" (radians) and "length".
*/
const rtByActorType = (o) => {
	const { position, angle, length, multiple, type, actors } = o;
	const p  = position.clone();
	const dx = Math.sin(angle);
	const dy = Math.cos(angle);
	const result  = [];
	const factors = actors.filter(e => (e._type & type) != 0);
	
	for (let i = 0; i < length; i++) {
		p.x += dx;
		p.y += dy;
		
		for (let n = factors.length; n--;) {
			const a = factors[n];
			if (!a.flags.isDestroyed && a.flags.hasColliders && a.colliders.isPointInside(p)) {
				if (multiple) { result.push(a); actors.splice(n, 1); }
					else return a;
			}
		}
	}
	return (multiple) ? result : null;
}

/*
	Attach a click handler into an element and wait until the element is clicked!
*/
const waitClick = async (elem) => {
	let clickResolve = null;
	
	addEvent(elem, 'click', e => {
		if (clickResolve != null) clickResolve(e);
	});		
	
	return new Promise(resolve => {				
		clickResolve = resolve;
	});			
}

/**
 * Removes all occurrences from array based on predicated function
 */
const remove = (arr, test) => {
	for (let i = arr.length; i--;) if (test(arr[i], i)) arr.splice(i, 1);
}

/**
 *  * Removes duplicate objects from an array, based on the value of property 'prop'
 *	i.e. when the value of the 'prop' is the same, the objects are considered to be duplicates
 * @param {[*]} arr 
 * @param {*} prop 
 * @returns 
 */
const removeDuplicates = (arr, prop) => {
	const flag   = {};
	const unique = [];
	arr.forEach(elem => {
		if (!flag[elem[prop]]) {
			flag[elem[prop]] = true;
			unique.push(elem);
		}
	});
	return unique;
}

/**
 * Returns true if array items are equal, false otherwise
 * @param {[*]} a Array
 * @param {[*]} b Array
 * @returns {boolean}
 */
const arraysEqual = (a, b)=> {
    return (a.length == b.length) && a.every((val, index) => val === b[index]);
}


const imgDims = (img) => {
	if (img == null) return Vec2.Zero();
	return new Vec2(img.naturalWidth || img.width, img.naturalHeight || img.height);
}

const randomInRange = (arr) => {
	return Math.random() * Math.abs(arr[0] - arr[1]) + arr[0];
}	

const randomOfArray = (arr) => {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * loadedJsonMap stores the url's and raw text of the loaded (h)json files. 
 * Why? Because getJson() promise can't return multiple parameters + most of the time this additional data is not needed + the signature would change if the getJSON() returned an object
 */
const loadedJsonMap = new WeakMap();

const getJSON = (url, getText) => {
	if (typeof url != 'string') throw new Error('Parameter "url" must be a string');
	if (!url.includes('.')) url += '.hjson';		// assume hjson file ending if none is supplied (v2.4)

	return new Promise(async (resolve, reject) => {		
		try {
			let text;
			const isHjson = (url.split('.').pop() == 'hjson');
			fetch(url)
				.then(response => { if (response.status == '404') return reject({ error:'file not found', context:url }); return response.text(); })
				.then(asText => { text = asText; try { return isHjson ? Hjson.parse(text) : JSON.parse(text); } catch (e) { reject({ error:'parse error', debug:e, context:url }) } })
				.then(json => {
					if (getText) loadedJsonMap.set(json, { text, url });
					resolve(json);
				});			
		} catch (e) {
			reject(e, url);			
		}
	});
}

const makeHJSON = (data) => {	
	return Hjson.stringify(data);
}

/**
 * Creates a file drop zone on given HTMLElement
 * @param {string} HTMLElementOrID 
 * @param {object} handlers 
 * @param {function=} handlers.dragenter Optional
 * @param {function=} handlers.dragleave Optional
 * @param {function} handlers.drop Required. Return FALSE to overried the default drop handling
 * @param {function=} handlers.filesready Optional
 */
const createFileDropZone = (HTMLElementOrID, handlers = {}) => {			
	const elem = (ID(HTMLElementOrID) == null) ? HTMLElementOrID : ID(HTMLElementOrID);
	
	addEvent(elem, 'drop', (e) => onDropFile(e));	
	addEvent(elem, 'dragover', (e) => e.preventDefault());	
	addEvent(elem, 'dragenter', (e) => { if ('dragenter' in handlers) handlers.dragenter(e); });
	addEvent(elem, 'dragleave', (e) => { if ('dragleave' in handlers) handlers.dragleave(e); });
	
	const onDropFile = (e) => {		
		e.preventDefault();
		
		const runDefaultCode = ('drop' in handlers) ? handlers.drop(e) : true;			// return FALSE from custom handler to override the default drop handling
		
		if (runDefaultCode) {
			const result = [];
			if (e.dataTransfer.items) {
				 for (let item of e.dataTransfer.items) {
					 if (item.kind === 'file') result.push(item.getAsFile());
				 }
			}
			if ('filesready' in handlers) handlers.filesready(result);
		}
	}
}

const imageFromBlob = (fileOrBlob) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = (e) => {
			URL.revokeObjectURL(e.target.src);
			resolve(e.target);
		}
		img.onerror = (e) => reject(e);
		img.src = URL.createObjectURL(fileOrBlob);
	});
}

const downloadFile = (filename, data, type = 'application/json') => {
	if (filename != '') {
		const blob = data instanceof Blob ? data : new Blob([data], { type });
		const url  = URL.createObjectURL(blob);
		const e    = window.document.createElement('a');
		e.href     = url;
		e.download = filename;
		e.click();  
		URL.revokeObjectURL(url);
	}
}

/**
 * Creates an open file dialog
 * @param {string} acceptedFiles ".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
 * @param {boolean} multiple allow multiple files to be selected
 * @return {Promise} array of files
 */
const openFileDialog = (acceptedFiles = '*', multiple = false) => {
	return new Promise(resolve => {
		var i = document.createElement('input');
		i.setAttribute('type', 'file');
		if (multiple == true) i.setAttribute('multiple', multiple);
		i.setAttribute('accept', acceptedFiles);
		i.addEventListener('change', e => resolve(i.files));
		i.click();	
	});
}

const wrapMax = (x, max) => {
	return (max + (x % max)) % max;
}

const wrapBounds = (x, min, max) => {
	return min + wrapMax(x - min, max - min);
}

const clamp = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

/**
 * Call inside the constructor of 'target' object
 * @param {Object} target Object instance to be extended
 * @param {class} source Class of source object which is to be mixed in with target
 */
const Mixin = (target, source, createParams) => {
	// copy the source class prototype over to the target object
    const props = Object.getOwnPropertyNames(source.prototype);    
    for (const p of props) {	
        if (p != 'constructor' && p != 'create') Object.defineProperty(target, p, Object.getOwnPropertyDescriptor(source.prototype, p));
    } 

	// create an instance of the source class
	const newObject = new source();

	// add it to the mixins collection of the target object (not needed to make things work, but it's fun to have)
	if (!('__mixins__' in target)) target.__mixins__ = [];
    target.__mixins__.push(newObject);    	

	// assign the source objects (this) properties over to target object (existing properties will be overwritten without warning!)
	Object.assign(target, newObject);

	// finally call the 'fake' constructor of the source object to initialize it
	if ('create' in newObject) newObject.create.call(target, createParams);
}

/**
 * Attaches a bunch of methods into the mainClasses prototype
 * @param {Class|Object} target The class that is about to get new methods attached
 * @param {Module|Object} source Object which contains the methods that need to be attached to the mainClass
 */
const addMethods = (target, source) => {	
	if (source == null) {
		var source = target.from;
		var target = target.to;		
	}
	for (const [name, method] of Object.entries(source)) target.prototype[name] = method;            
}

/**
 * Copies some "properties" of "source" object into the "target" object
 * @param {object} target 
 * @param {object} source 
 * @param {[*]|string} properties Can be either an array of strings or a string (space separated list of properties)
 */
const copyProps = (target, source, properties) => {
	if (typeof properties == 'string') properties = properties.split(' ');
	for (const [k, v] of Object.entries(source)) {
		if (properties.includes(k)) target[k] = v;
	}
}

/**
 * Creates a new HTML element
 * @param {object} o Parameters object
 * @param {string|HTMLElement} o.parent Either a reference to the parent HTMLElement or an ID of the parent element
 * @param {string=} o.text Optional. Textcontent for the created element
 * @param {string=} o.id Optional. ID for the created element
 * @param {string=} o.class Optional. Space separated list of CSS class names to be added in the created element
 * @param {string=} o.type DEPRECATED. Optional. Type of the created HTML Element. Defaults to "div".
 * @param {boolean} o.tagName Optional. Override automatic tag name assignment for <input> types (allows defining <button> tag) NEW!!!
 * 	NOTE! If the type is any of InputTypes constants, the type of the element is set to "input" and the type field becomes the value of <input type=""> 
 * @returns {HTMLElement}
 */
const addElem = (o) => {		
	let kind = ('type' in o) ? o.type : 'div';	
	if ('tagName' in o) {
		kind = o.tagName;
	} else
		if (InputTypes.includes(kind)) kind = 'input';													// check if the given "type" is any of InputTypes constants
	
    const el = document.createElement(kind);

	if (kind == 'input') el.type = o.type;

    if ('text' in o)  el.textContent = o.text;
    if ('class' in o) el.className = o.class;
    if ('id' in o)    el.id = o.id;

	for (const [k, v] of Object.entries(o)) {
		if (k == 'tagName') {
			continue;
		} else
		if (k.substring(0, 2) == 'on') {
			const evt = k.slice(2);
			addEvent(el, evt, v);
		} else
		if (!['text', 'class', 'id', 'parent', 'type'].includes(k)) {
			el.setAttribute(k, v);
		}
	}

    const parent = ('parent' in o) ? ((typeof o.parent == 'string') ? document.getElementById(o.parent) : o.parent) : document.body;
    parent.appendChild(el);
    return el;
}

const addPropertyListener = (object, prop, handler) => {
	if (!(prop in object)) throw `Property ${prop} does not exist in object ${object}`;

	let temp;
	Object.defineProperty(object, prop, {
		set(x) {
			const result = handler(x, object[prop]);		
			if (result == null) temp = x;
		},
		get(x) {
			return temp;
		}
 	});	
}

/**
 * Get shortest distance between two angles (in radians)
 * @param {number} a0 Angle (in radians)
 * @param {number} a1 Angle (in radians)
 * @returns 
 */
const shortAngleDist = (a0, a1) => {
    var max = Math.PI * 2;
    var da = (a1 - a0) % max;
    return 2 * da % max - da;
}

/**
 * Smooth interpolation between two angles using shortest path (in radians)
 * @param {number} a0 Starting angle (in radians)
 * @param {number} a1 Ending angle (in radians)
 * @param {number} t Float 0 - 1 interpolation where 0 is starting angle and 1 is ending angle
 * @returns 
 */
const angleLerp = (a0, a1, t) => {
    return a0 + shortAngleDist(a0, a1) * t;
}

/**
 * Request sourcemap
 * @param {string} url fully qualified url (including https://)
 * @param {string} query URL query string without the preceding '?' question mark
 */
const smap = (url, query) => {
    const script = document.createElement("script");    
    script.textContent = `//# sourceMappingURL=${url}?${query}`;    
    document.head.appendChild(script);
    script.remove(); 
}

/**
 * 
 * @param {HTMLElement|string} elem 
 * @returns Returns HTMLElement 
 */
const ID = (elem) => { 
	return (typeof elem == 'string') ? document.getElementById(elem) : elem; 
}

const addEvent = (elem, evnt, func, params = false) => {
	var elem = ID(elem);	
	if (elem && 'addEventListener' in elem) {				
		elem.addEventListener(evnt, func, params);		
		return func;
	} 
	throw 'Failed to set event listener';
}

const isObject 	 = (o) => { return o === Object(o); }
const isBoolean  = (o) => { return typeof o === 'boolean'; }
const isFunction = (o) => { return typeof o == 'function'; }
const isNumeric  = (o) => { return !isNaN(parseFloat(o)) && isFinite(o); }	// regardless of type...

const sealProp = (obj, prop, /* optional */value) => {
	if (value !== undefined) Object.defineProperty(obj, prop, { value, writable:true, configurable:false });
		else Object.defineProperty(obj, prop, { writable:true, configurable:false });
}

/**
 * 
 * @param {string} url 
 * @param {object} settings 
 * @param {string} settings.fileType
 * @param {boolean} settings.verbose
 * @param {function} settings.callback
 * @param {document} settings.HTMLDocument Optional. Reference to document where the dynamic download code is injected. If not provided, uses the current "document"
 * @returns 
 */
const require = (url, settings = {}) => { 
	var fileType = ('fileType' in settings) ? settings.fileType : 'auto'; 
	var verbose  = ('verbose' in settings) ? settings.verbose : true; 
	var callback = ('callback' in settings) ? settings.callback : null; 
	var doc      = ('document' in settings) ? settings.document : document;
	
    let file = url.split('/').pop().split('?').shift();
	if (fileType == 'auto') fileType = file.split('.').pop();
    let addr = (fileType == 'js') ? 'src' : 'href';

// check if requested URL is already in <head>, if not, load it:
    let head = doc.head;
    for (var i = 0; i < head.children.length; i++) { 
        var tag = head.children[i];        
        if (addr in tag && tag[addr].indexOf(url) != -1) { 
			if (verbose) console.warn('Skipped file: ' + url); 
			if (callback) callback(url, null);
			return false; 
		}         
    }

    switch (fileType) { 
        case 'css':             
            var tag   = doc.createElement('link');
            tag.rel   = 'stylesheet';
            tag.type  = 'text/css';
            tag.href  = url;
			tag.crossOrigin = 'anonymous';
        break;
        case 'js':            
            var tag = doc.createElement('script');
			if (settings.module) tag.type = 'module';
            tag.src  = url;
        break;		
		default:
			console.warn('Filetype not detected:', url);
    }
    if (verbose)  console.log('Loading: ' + url);
	if (callback) tag.onload = function() { callback(url, tag); }
    head.appendChild(tag);
	
	return true;
}

const getPos = (elem, includeScrolling) => {
	var cr = elem.getBoundingClientRect() || { left:0, top:0, right:0, bottom:0 }
	if (includeScrolling) { 
		const x = document.documentElement.scrollLeft;
		const y = document.documentElement.scrollTop;
		var  cr = { left:cr.left+x, top:cr.top+y, right:cr.right+x, bottom:cr.bottom+y };
	}
	return cr;
}

const style = (elem, properties, compute) => {	
	if (properties == undefined) return;
	var elem = ID(elem);
	var propList = properties.split(';');
	var property, value, obj;
	for (var i = 0; i < propList.length; i++) {
		/*
		   obj      = propList[i].split(':'); 
		   this isn't sufficient when we have --> background-image:url('http: <-- there is ANOTHER colon which will split the string in 3 parts!
		   so instead of simple split ':' we split with colon, except when the colon in between open and close parenthesis!
	    */
	    obj = propList[i].match(/(?:[^:\(]+|\([^\)]*\))+/g); 
	   
	    if (obj != null) {
		   if (obj.length == 2) {
			   property = obj[0].trim();
			   value    = obj[1].trim();
			   elem.style[property] = value;
			   if (compute) { var n = getComputedStyle(elem)[property]; }
		   } else if (obj.length == 1) {
			   property = obj[0].trim();
			   elem.style[property] = '';
		   }
	    }
	}
}   

/**
 * Checks whether the 'object' has a class name or constructor named 'className' in its prototype chain. 
 * This function deep scans the entire prototype chain. 
 * Note! This function will only check for name equality. This is not the same as 'instanceOf' built in operator and does not ensure the equality of the classes.
 * Use this when you need to compare objects which are created in different contexts (iframe or window) where 'instanceOf' will not work.
 */
const isInstanceOf = (object, className) => {	
	if ( !isObject(object)) return false;
	var n = object;
	while (n) {
		if (('constructor' in n) && (n.constructor.name == className)) return true;
		if (n.name != '' && n.name == className) return true;		
		n = Object.getPrototypeOf(n);
	}
	return false;
}

/**
 * Trims excess, leading and trailing slashes/backslashes from given string 
 * @param {string} str string to process 
 * @returns 
 */
const trimPath = (str, separator = '/') => {
	let result = str.split(/\/|\\/).filter(v => v !== '').join(separator)
	result = result.replace(/http:\//y, 'http://');
	result = result.replace(/https:\//y, 'https://');
	return result;
}

const getEnumKey = (enumObject, value) => {
	const o = Object.entries(enumObject).find(f => f[1] == value);
	if (o) return o[0];
}

export { 
	loadedJsonMap,
	preloadImages, 
	preloadVideo, 
	getJSON, 
	imageFromBlob,
	imgDims,
	makeHJSON,
	smap,
	
	downloadFile,
	createFileDropZone,
	openFileDialog,

	delay, 
	shuffle, 

	rtByActorType,
	randomInRange, 
	randomOfArray,
	wrapBounds,
	shortAngleDist,
	angleLerp,
	clamp,

	removeDuplicates, 
	arraysEqual,
	remove,
	
	Mixin,
	addElem,
	addEvent,
	ID,
	waitClick, 
	isBoolean,
	isFunction,
	isObject,
	isNumeric,
	isInstanceOf,
	require,
	addMethods,
	addPropertyListener,
	copyProps,
	sealProp,
	getPos,
	style,
	trimPath,
	getEnumKey
}
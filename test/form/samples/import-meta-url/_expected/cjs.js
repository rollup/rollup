'use strict';

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function log(url) {
	if (typeof document === 'undefined') {
		console.log(url);
	} else {
		document.body.innerText = url;
	}
}

log((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('cjs.js', document.baseURI).href)));

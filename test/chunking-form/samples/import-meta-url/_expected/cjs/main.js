'use strict';

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function log(url) {
	if (typeof document === 'undefined') {
		console.log(url);
	} else {
		document.body.innerHTML += url + '<br>';
	}
}

log('main: ' + (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('main.js', document.baseURI).href)));
Promise.resolve().then(function () { return require('./nested/chunk.js'); });

exports.log = log;

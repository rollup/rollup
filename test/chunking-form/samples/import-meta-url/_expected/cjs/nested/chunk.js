'use strict';

function log(url) {
	if (typeof document === 'undefined') {
		console.log(url);
	} else {
		document.body.innerHTML += url + '<br>';
	}
}

log('main: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('nested/chunk.js', document.baseURI).href)));
new Promise(function (resolve) { resolve(require('./chunk2.js')); });

exports.log = log;

'use strict';

function log(url) {
	if (typeof document === 'undefined') {
		console.log(url);
	} else {
		document.body.innerHTML += url + '<br>';
	}
}

log('main: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
Promise.resolve().then(function () { return require('./nested/chunk.js'); });

exports.log = log;

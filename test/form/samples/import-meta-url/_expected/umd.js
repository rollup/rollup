(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	function log(url) {
		if (typeof document === 'undefined') {
			console.log(url);
		} else {
			document.body.innerText = url;
		}
	}

	log((typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.src || new URL('umd.js', document.baseURI).href)));

}));

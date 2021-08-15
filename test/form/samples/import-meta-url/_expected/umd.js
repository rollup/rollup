(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function log(url) {
		if (typeof document === 'undefined') {
			console.log(url);
		} else {
			document.body.innerText = url;
		}
	}

	log((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('umd.js', document.baseURI).href)));

}));

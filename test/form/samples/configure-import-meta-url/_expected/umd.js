(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	console.log('resolved');

	console.log((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('umd.js', document.baseURI).href)));

	console.log('umd.js/configure-import-meta-url/main.js');

}));

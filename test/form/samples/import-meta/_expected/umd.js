(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	console.log(({ url: (typeof document === 'undefined' ? (typeof self === 'undefined' || typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : location.href) : (document.currentScript && document.currentScript.src || new URL('umd.js', document.baseURI).href)) }));

})));

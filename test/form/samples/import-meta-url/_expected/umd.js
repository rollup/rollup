(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	console.log((typeof document !== 'undefined' ? document.currentScript && document.currentScript.src || location.href : new URL('file:' + __filename).href));

})));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./relative'), require('abso/lute'), require('./relative.js'), require('abso/lute.js')) :
	typeof define === 'function' && define.amd ? define(['./relative.js', 'abso/lute', './relative.js', 'abso/lute.js'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.relative, global.lute, global.relative_js, global.lute_js));
})(this, (function (relative, absolute, relativeExtension, absoluteExtension) { 'use strict';

	console.log(relative, absolute, relativeExtension, absoluteExtension);

}));

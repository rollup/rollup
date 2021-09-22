(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('quoted\'\\
\ \ external1'), require('./quoted\'\\
\ \ external2'), require('./C:/File/Path.js')) :
	typeof define === 'function' && define.amd ? define(['quoted\'\\
\ \ external1', './quoted\'\\
\ \ external2', './C:/File/Path'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.quotedExternal1, global.quotedExternal2, global.quotedExternal3));
})(this, (function (quoted_____external1, quoted_____external2, Path_js) { 'use strict';

	console.log(quoted_____external1.foo, quoted_____external2.bar, Path_js.baz);

}));

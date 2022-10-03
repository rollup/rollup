(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./foo.json')) :
	typeof define === 'function' && define.amd ? define(['exports', './foo.json'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.json));
})(this, (function (exports, json) { 'use strict';

	console.log(json);

	import('./foo.json').then(console.log);

	exports.json = json;

}));

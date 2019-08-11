(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('acorn')) :
	typeof define === 'function' && define.amd ? define(['acorn'], factory) :
	(global = global || self, factory(global.acorn));
}(this, function (acorn) { 'use strict';

	function parse(source) {
		return acorn.parse(source, { ecmaVersion: 6 });
	}

	console.log(parse('foo'));

}));

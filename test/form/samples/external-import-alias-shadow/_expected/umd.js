(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('acorn')) :
	typeof define === 'function' && define.amd ? define(['acorn'], factory) :
	(factory(global.acorn));
}(this, (function (acorn) { 'use strict';

	function parse(source) {
		return acorn.parse(source, { ecmaVersion: 6 });
	}

	console.log(parse('foo'));

})));

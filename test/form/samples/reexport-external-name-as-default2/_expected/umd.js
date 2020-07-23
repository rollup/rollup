(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	global.bundle = factory(global.external);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (external) { 'use strict';

	return external.objAlias;

})));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	global.reexportsDefaultExternal = factory(global.external);
}(typeof self !== 'undefined' ? self : this, function (external) { 'use strict';

	return external.objAlias;

}));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('leaflet')) :
	typeof define === 'function' && define.amd ? define(['leaflet'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.L));
}(this, (function (L) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	L = _interopDefault(L);

	L.terminator = function(options) {
	};

})));

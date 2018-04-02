(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('leaflet')) :
	typeof define === 'function' && define.amd ? define(['leaflet'], factory) :
	(factory(global.L));
}(this, (function (L) { 'use strict';

	L = L && L.hasOwnProperty('default') ? L['default'] : L;

	L.terminator = function(options) {
	};

})));

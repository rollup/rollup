(function (factory) {
	typeof define === 'function' && define.amd ? define(['leaflet'], factory) :
	factory(global.L);
}(function (L) { 'use strict';

	L = L && L.hasOwnProperty('default') ? L['default'] : L;

	L.terminator = function(options) {
	};

}));

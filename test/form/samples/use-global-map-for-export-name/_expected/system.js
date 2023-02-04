System.register('leaflet.terminator', ['leaflet'], (function () {
	'use strict';
	var L;
	return {
		setters: [function (module) {
			L = module.default;
		}],
		execute: (function () {

			L.terminator = function(options) {
			};

		})
	};
}));

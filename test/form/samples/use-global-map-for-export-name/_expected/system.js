System.register('leaflet.terminator', ['leaflet'], function (exports, module) {
	'use strict';
	var L;
	return {
		setters: [function (module) {
			L = module.default;
		}],
		execute: function () {

			L.terminator = function(options) {
			};

		}
	};
});

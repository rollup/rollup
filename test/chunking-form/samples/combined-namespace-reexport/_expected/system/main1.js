System.register(['./generated-geometry.js'], (function () {
	'use strict';
	var geometry, volume;
	return {
		setters: [function (module) {
			geometry = module.g;
			volume = module.v;
		}],
		execute: (function () {

			var mod = /*#__PURE__*/Object.freeze({
				__proto__: null,
				geometry: geometry,
				volume: volume
			});

			console.log(mod);

		})
	};
}));

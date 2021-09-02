System.register(['./generated-geometry.js'], (function () {
	'use strict';
	var volume, geometry;
	return {
		setters: [function (module) {
			volume = module.v;
			geometry = module.g;
		}],
		execute: (function () {

			var mod = /*#__PURE__*/Object.freeze({
				__proto__: null,
				volume: volume,
				geometry: geometry
			});

			console.log(mod);

		})
	};
}));

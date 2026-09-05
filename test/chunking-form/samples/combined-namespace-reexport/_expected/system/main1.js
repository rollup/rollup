System.register(['./generated-geometry.js'], (function () {
	'use strict';
	var geometry, volume;
	return {
		setters: [function (module) {
			geometry = module.g;
			volume = module.v;
		}],
		execute: (function () {

			var mod = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				geometry: geometry,
				volume: volume
			}, null));

			console.log(mod);

		})
	};
}));

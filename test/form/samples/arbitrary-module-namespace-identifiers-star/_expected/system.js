System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var __;
	return {
		setters: [function (module) {
			__ = module["*"];
			exports({ "**": module["*"], reexportedStar: module["*"] });
		}],
		execute: (function () {

			const star = 'star';
			const doubleStar = 'double star';

			var dep = /*#__PURE__*/Object.freeze({
				__proto__: null,
				"*": star,
				"**": doubleStar
			});

			console.log(__, star, doubleStar, true, false, dep);

			const legal = exports("*", 10);

		})
	};
}));

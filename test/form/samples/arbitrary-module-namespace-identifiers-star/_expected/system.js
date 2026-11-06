System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		"*": 1,
		"*default": 1,
		default: 1,
		"**": 1,
		reexportedStar: 1
	};
	var __;
	return {
		setters: [function (module) {
			__ = module["*"];
			var setter = { __proto__: null, "**": module["*"], reexportedStar: module["*"] };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			const star = 'star';
			const doubleStar = 'double star';
			var dep = exports("*default", 42);

			var dep$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				"*": star,
				"**": doubleStar,
				default: dep
			});

			console.log(__, star, doubleStar, true, false, dep$1);

			const legal = exports("*", 10);

		})
	};
}));

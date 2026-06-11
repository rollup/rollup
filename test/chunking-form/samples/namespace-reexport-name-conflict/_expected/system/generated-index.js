System.register(['./generated-dep.js', 'external'], (function (exports) {
	'use strict';
	var reexported$1, reexported;
	return {
		setters: [function (module) {
			reexported$1 = module.r;
		}, function (module) {
			reexported = module.reexported;
		}],
		execute: (function () {

			console.log(reexported);

			var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				reexported: reexported$1
			}, null));
			exports("l", lib);

		})
	};
}));

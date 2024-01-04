System.register('bundle', ['x'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		["__proto__"]: 1,
		x: 1,
		default: 1
	};
	return {
		setters: [function (module) {
			var setter = { __proto__: null };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			const __proto__ = exports("__proto__", 1);

			var x = /*#__PURE__*/Object.freeze({
				__proto__: null,
				["__proto__"]: __proto__
			});
			exports("x", x);

		})
	};
}));

System.register('bundle', ['x'], (function (exports) {
	'use strict';
	var _starExcludes = /*#__PURE__*/Object.setPrototypeOf({
		["__proto__"]: 1,
		x: 1,
		default: 1
	}, null);
	return {
		setters: [function (module) {
			var setter = /*#__PURE__*/Object.setPrototypeOf({}, null);
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			const __proto__ = exports("__proto__", 1);

			var x = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				["__proto__"]: __proto__
			}, null));
			exports("x", x);

		})
	};
}));

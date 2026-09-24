System.register('exposedInternals', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = /*#__PURE__*/Object.setPrototypeOf({
		internalFn: 1,
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

			exports("internalFn", internalFn);

			function internalFn(path) {
				return path[0] === '.';
			}

		})
	};
}));

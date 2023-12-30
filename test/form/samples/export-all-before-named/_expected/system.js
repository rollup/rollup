System.register('exposedInternals', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = {
		internalFn: 1,
		default: 1
	};
	return {
		setters: [function (module) {
			var setter = {};
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

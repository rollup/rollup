System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
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



		})
	};
}));

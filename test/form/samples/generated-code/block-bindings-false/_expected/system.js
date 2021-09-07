System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = { 'default': 1 };
	var foo__default;
	return {
		setters: [module => {
			foo__default = module["default"];
			var setter = {};
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			console.log(foo__default);

		})
	};
}));

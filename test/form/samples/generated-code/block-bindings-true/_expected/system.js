System.register('bundle', ['external'], (function (exports) {
	'use strict';
	const _starExcludes = { 'default': 1 };
	var foo__default;
	return {
		setters: [module => {
			foo__default = module["default"];
			const setter = {};
			for (const name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			console.log(foo__default);

		})
	};
}));

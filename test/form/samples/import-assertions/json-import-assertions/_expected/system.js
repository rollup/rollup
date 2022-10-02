System.register('bundle', ['./foo.json'], (function (exports, module) {
	'use strict';
	var json;
	return {
		setters: [function (module) {
			json = module.default;
			exports('json', module.default);
		}],
		execute: (function () {

			console.log(json);

			module.import('./foo.json', { assert: { type: 'json' } }).then(console.log);

		})
	};
}));

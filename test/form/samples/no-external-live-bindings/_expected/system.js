System.register('bundle', ['external1', 'external2'], (function (exports, module) {
	'use strict';
	var _starExcludes = {
		dynamic: 1,
		default: 1,
		external1: 1
	};
	return {
		setters: [function (module) {
			exports("external1", module.external1);
		}, function (module) {
			var setter = {};
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			const dynamic = exports("dynamic", module.import('external3'));

		})
	};
}));

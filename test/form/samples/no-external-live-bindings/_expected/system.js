System.register('bundle', ['external1', 'external2'], (function (exports, module) {
	'use strict';
	var _starExcludes = /*#__PURE__*/Object.setPrototypeOf({
		dynamic: 1,
		default: 1,
		external1: 1
	}, null);
	return {
		setters: [function (module) {
			exports("external1", module.external1);
		}, function (module) {
			var setter = /*#__PURE__*/Object.setPrototypeOf({}, null);
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

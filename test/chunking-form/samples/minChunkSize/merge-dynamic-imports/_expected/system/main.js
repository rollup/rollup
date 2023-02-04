System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const big =
				exports('big', '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890');

			const small1 = exports('small1', module.import('./generated-small2.js').then(function (n) { return n.s; }));
			const small2 = exports('small2', module.import('./generated-small2.js').then(function (n) { return n.a; }));

		})
	};
}));

System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const shared = exports('s', true);

			module.import('./generated-dynamic1.js').then(function (n) { return n.d; });
			console.log(shared);

		})
	};
}));

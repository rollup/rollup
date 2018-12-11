System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('dep');

			const dep = exports('a', 'dep');

			console.log('dynamic', dep);
			const dynamic = exports('b', 'dynamic');

		}
	};
});

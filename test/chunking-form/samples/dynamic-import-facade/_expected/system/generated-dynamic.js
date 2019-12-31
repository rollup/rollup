System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			console.log('dep');

			const dep = 'dep';

			console.log('dynamic', dep);
			const dynamic = exports('dynamic', 'dynamic');

			console.log('main2', dynamic, dep);

		}
	};
});

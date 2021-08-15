System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			console.log('dep');
			const dep = 'dep';

			console.log('dynamic', dep);

			console.log('main2', dep);

		})
	};
}));

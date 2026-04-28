System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('dep');

			const dep = exports("d", 'dep');

			console.log('dynamic', dep);
			const dynamic = exports("b", 'dynamic');

			var dynamic$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				dynamic: dynamic
			});
			exports("a", dynamic$1);

		})
	};
}));

System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('dep');

			const dep = exports("d", 'dep');

			console.log('dynamic', dep);
			const dynamic = exports("a", 'dynamic');

			var dynamic$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				dynamic: dynamic
			});
			exports("b", dynamic$1);

		})
	};
}));

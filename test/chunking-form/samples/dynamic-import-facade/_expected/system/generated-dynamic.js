System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			console.log('dep');

			const dep = exports('a', 'dep');

			console.log('dynamic', dep);
			const dynamic = exports('d', 'dynamic');

			var dynamic$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				dynamic: dynamic
			}, '__esModule', { value: true }));
			exports('b', dynamic$1);

		}
	};
});

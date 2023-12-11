System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			const s1 = x => x;

			const { d1: d1$1 } = Promise.resolve().then(function () { return dynamic1; });
			const { d2: d2$1 } = Promise.resolve().then(function () { return dynamic2; });

			console.log(s1, d1$1, d2$1);

			const s2 = x => x;

			const d1 = x => s1(s2(x));

			var dynamic1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				d1: d1
			});

			const d2 = x => s1(s2(x));

			var dynamic2 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				d2: d2
			});

		})
	};
}));

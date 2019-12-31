System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var inlined = 'inlined';
			const x = 1;

			var inlined$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				'default': inlined,
				x: x
			});

			var separate = exports('s', 'separate');
			const x$1 = exports('x', 2);

			var separate$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				'default': separate,
				x: x$1
			});

			const inlined$2 = exports('i', Promise.resolve().then(function () { return inlined$1; }));
			const separate$2 = exports('a', Promise.resolve().then(function () { return separate$1; }));

		}
	};
});

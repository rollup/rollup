System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var a = exports('a', 'a');
			var b = exports('b', 'a');

			var main2 = /*#__PURE__*/Object.freeze({
				a: a,
				b: b
			});
			exports('m', main2);

		}
	};
});

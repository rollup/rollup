System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var hello = 'world';

			var hello_1 = exports('hello', hello);

			var myBasePkg = exports('default', /*#__PURE__*/Object.defineProperty({
				hello: hello_1
			}, '__esModule', {value: true}));

		}
	};
});

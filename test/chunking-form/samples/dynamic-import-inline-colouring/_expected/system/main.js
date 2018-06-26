System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var foo = "FOO";

			var foo$1 = /*#__PURE__*/Object.freeze({
				default: foo
			});

			var main = exports('default', Promise.resolve().then(function () { return foo$1; }));

		}
	};
});

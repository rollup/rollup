System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('a', foo);

			function foo() {
				console.log('dep2');
			}

			Promise.resolve().then(function () { return dep1; });



			var dep1 = /*#__PURE__*/Object.freeze({

			});

		}
	};
});

System.register('bundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports({
				aFoo: void 0,
				aBar: void 0,
				bFoo: void 0,
				bBar: void 0,
				cFoo: void 0,
				dBar: void 0
			});

			var aFoo, aBar;
			aBar = exports('aBar', 2);

			var bFoo, bBar;
			bFoo = exports('bFoo', 2);

			var cFoo, cBar = exports('cBar', 1);
			cBar = exports('cBar', 2);

			var dFoo = exports('dFoo', 1), dBar;
			dFoo = exports('dFoo', 2);

		}
	};
});

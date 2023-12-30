System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var aFoo, aBar; exports({ aFoo: aFoo, aBar: aBar });
			exports("aBar", aBar = 2);

			var bFoo, bBar; exports({ bFoo: bFoo, bBar: bBar });
			exports("bFoo", bFoo = 2);

			var cFoo, cBar = 1; exports({ cFoo: cFoo, cBar: cBar });
			exports("cBar", cBar = 2);

			var dFoo = 1, dBar; exports({ dFoo: dFoo, dBar: dBar });
			exports("dFoo", dFoo = 2);

		})
	};
}));

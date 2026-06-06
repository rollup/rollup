System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const DEP = exports("D", 'DEP');

			const DYNAMIC_2 = 'DYNAMIC_2';

			var dynamic2 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				DYNAMIC_2: DYNAMIC_2
			});
			exports("d", dynamic2);

			const DYNAMIC_3 = 'DYNAMIC_3';

			var dynamic3 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				DYNAMIC_3: DYNAMIC_3
			});
			exports("a", dynamic3);

			const DYNAMIC_1 = 'DYNAMIC_1';

			var dynamic1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				DEP: DEP,
				DYNAMIC_1: DYNAMIC_1,
				DYNAMIC_2: DYNAMIC_2,
				DYNAMIC_3: DYNAMIC_3
			});
			exports("b", dynamic1);

		})
	};
}));

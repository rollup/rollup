System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const DEP = exports('D', 'DEP');

			const DYNAMIC_2 = 'DYNAMIC_2';

			var dynamic2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				DYNAMIC_2: DYNAMIC_2
			}, '__esModule', { value: true }));
			exports('d', dynamic2);

			const DYNAMIC_3 = 'DYNAMIC_3';

			var dynamic3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				DYNAMIC_3: DYNAMIC_3
			}, '__esModule', { value: true }));
			exports('a', dynamic3);

			const DYNAMIC_1 = 'DYNAMIC_1';

			var dynamic1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				DYNAMIC_1: DYNAMIC_1,
				DEP: DEP,
				DYNAMIC_2: DYNAMIC_2,
				DYNAMIC_3: DYNAMIC_3
			}, '__esModule', { value: true }));
			exports('b', dynamic1);

		}
	};
});

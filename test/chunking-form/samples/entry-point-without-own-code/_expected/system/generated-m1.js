System.register(['./m2.js'], function (exports) {
	'use strict';
	var m2;
	return {
		setters: [function (module) {
			m2 = module.default;
			exports('m', module.default);
		}],
		execute: function () {



			var ms = /*#__PURE__*/Object.freeze({
				m2: m2
			});
			exports('a', ms);

		}
	};
});

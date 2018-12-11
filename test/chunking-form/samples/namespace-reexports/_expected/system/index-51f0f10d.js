System.register(['./hsl2hsv.js'], function (exports, module) {
	'use strict';
	var hsl2hsv;
	return {
		setters: [function (module) {
			hsl2hsv = module.default;
			exports('b', module.default);
		}],
		execute: function () {

			var hsl2hsv$1 = 'asdf';

			console.log(hsl2hsv$1);

			var lib = /*#__PURE__*/Object.freeze({
				hsl2hsv: hsl2hsv
			});
			exports('a', lib);

		}
	};
});

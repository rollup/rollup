System.register(['./hsl2hsv.js'], function (exports) {
	'use strict';
	var hsl2hsv$1;
	return {
		setters: [function (module) {
			hsl2hsv$1 = module.default;
			exports('h', module.default);
		}],
		execute: function () {

			var hsl2hsv = 'asdf';

			console.log(hsl2hsv);

			var lib = /*#__PURE__*/Object.freeze({
				hsl2hsv: hsl2hsv$1
			});
			exports('l', lib);

		}
	};
});

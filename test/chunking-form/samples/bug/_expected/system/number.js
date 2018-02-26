System.register(['./clamp.js', './inRange.js', './random.js', './number.default.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('clamp', module.default);
		}, function (module) {
			exports('inRange', module.default);
		}, function (module) {
			exports('random', module.default);
		}, function (module) {
			exports('default', module.default);
		}],
		execute: function () {



		}
	};
});

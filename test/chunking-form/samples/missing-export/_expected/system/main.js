System.register(['./d1.js', './d2.js', './d3.js'], function (exports, module) {
	'use strict';
	var _shimmedExport$1, _shimmedExport$2;
	return {
		setters: [function (module) {
			_shimmedExport$1 = module._shimmedExport;
		}, function (module) {
			_shimmedExport$2 = module._shimmedExport;
		}, function (module) {
			var _setter = {};
			_setter.default = module._shimmedExport;
			_setter.d3f1 = module._shimmedExport;
			_setter.d3f2 = module._shimmedExport;
			_setter._shimmedExport = module._shimmedExport;
			_setter._shimmedExportnpm$1 = module._shimmedExport;
			exports(_setter);
		}],
		execute: function () {

			_shimmedExport();
			_shimmedExport();
			_shimmedExport$1();
			_shimmedExport();

			_shimmedExport();
			_shimmedExport();
			_shimmedExport$2();
			_shimmedExport();

			const _shimmedExport$2$1 = exports('_shimmedExport$2', null);

		}
	};
});

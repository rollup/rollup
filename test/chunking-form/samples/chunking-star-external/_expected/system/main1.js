System.register(['starexternal1', 'external1', 'starexternal2', 'external2', './generated-chunk.js'], function (exports, module) {
	'use strict';
	var _starExcludes = { main: 1, default: 1, e: 1, dep: 1 };
	return {
		setters: [function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}, function (module) {
			exports('e', module.e);
		}, function () {}, function () {}, function (module) {
			exports('dep', module.d);
		}],
		execute: function () {

			var main = exports('main', '1');

		}
	};
});

System.register('bundle', ['external1', 'external2'], function (exports, module) {
	'use strict';
	var _starExcludes = { dynamic: 1, default: 1, external1: 1 };
	return {
		setters: [function (module) {
			exports('external1', module.external1);
		}, function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}],
		execute: function () {

			const dynamic = exports('dynamic', module.import('external3'));

		}
	};
});

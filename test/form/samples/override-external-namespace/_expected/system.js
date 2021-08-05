System.register('bundle', ['external'], function (exports) {
	'use strict';
	var _starExcludes = { a: 1, b: 1, c: 1, reassign: 1, default: 1 };
	return {
		setters: [function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}],
		execute: function () {

			const a = exports('a', 'defined');
			let b; exports('b', b);
			var c; exports('c', c);
			const reassign = exports('reassign', () => (exports('b', b = 'defined')));

		}
	};
});

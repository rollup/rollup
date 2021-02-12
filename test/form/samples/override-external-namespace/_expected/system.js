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

			exports({
				b: void 0,
				c: void 0
			});

			const a = exports('a', 'defined');
			let b;
			var c;
			const reassign = exports('reassign', () => (b = exports('b', 'defined')));

		}
	};
});

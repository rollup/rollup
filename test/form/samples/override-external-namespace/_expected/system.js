System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		a: 1,
		b: 1,
		c: 1,
		reassign: 1,
		default: 1
	};
	return {
		setters: [function (module) {
			var setter = { __proto__: null };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			const a = exports("a", 'defined');
			let b; exports("b", b);
			var c; exports("c", c);
			const reassign = exports("reassign", () => (exports("b", b = 'defined')));

		})
	};
}));

System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		default: 1,
		syntheticMissing: 1
	};
	var foo__default, foo$1;
	return {
		setters: [module => {
			foo__default = module.default;
			foo$1 = module;
			var setter = { __proto__: null };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			var _missingExportShim = void 0;

			const foo = 'bar';

			var other = /*#__PURE__*/Object.freeze({
				__proto__: null,
				foo: foo,
				missing: _missingExportShim
			});

			var synthetic = { bar: 'baz'};

			console.log(foo__default, foo$1, other, synthetic.bar, _missingExportShim);
			var main = exports("default", 42);

			exports("syntheticMissing", synthetic.syntheticMissing);

		})
	};
}));

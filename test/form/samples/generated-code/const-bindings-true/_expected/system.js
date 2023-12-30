System.register('bundle', ['external'], (function (exports) {
	'use strict';
	const _starExcludes = {
		default: 1,
		syntheticMissing: 1
	};
	var foo__default, foo$1;
	return {
		setters: [module => {
			foo__default = module.default;
			foo$1 = module;
			const setter = {};
			for (const name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			const _missingExportShim = void 0;

			const foo = 'bar';

			const other = /*#__PURE__*/Object.freeze({
				__proto__: null,
				foo: foo,
				missing: _missingExportShim
			});

			const synthetic = { bar: 'baz' };

			console.log(foo__default, foo$1, other, bar, _missingExportShim);
			const main = exports("default", 42);

			exports("syntheticMissing", synthetic.syntheticMissing);

		})
	};
}));

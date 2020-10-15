System.register(['external-auto', 'external-default', 'external-defaultOnly'], function () {
	'use strict';
	var externalAuto, foo, externalDefault, foo$1, externalDefaultOnly, externalDefaultOnly__default;
	return {
		setters: [function (module) {
			externalAuto = module;
			foo = module.foo;
		}, function (module) {
			externalDefault = module;
			foo$1 = module.foo;
		}, function (module) {
			externalDefaultOnly = module;
			externalDefaultOnly__default = module.default;
		}],
		execute: function () {

			assert.strictEqual(externalAuto[Symbol.toStringTag], 'Module');
			assert.strictEqual(Object.prototype.toString.call(externalAuto), '[object Module]');
			assert.strictEqual(foo, 42);

			assert.strictEqual(externalDefault[Symbol.toStringTag], 'Module');
			assert.strictEqual(Object.prototype.toString.call(externalDefault), '[object Module]');
			assert.strictEqual(foo$1, 42);

			assert.strictEqual(externalDefaultOnly[Symbol.toStringTag], 'Module');
			assert.strictEqual(Object.prototype.toString.call(externalDefaultOnly), '[object Module]');
			assert.deepStrictEqual(externalDefaultOnly__default, { foo: 42 });

		}
	};
});

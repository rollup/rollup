define(['exports', 'external-all', 'external-default-named', 'external-named', 'external-named-namespace'], function (exports, externalAll, externalDefaultNamed, externalNamed, externalNamedNamespace) { 'use strict';



	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: function () {
			return externalAll.foo;
		}
	});
	Object.defineProperty(exports, 'baz', {
		enumerable: true,
		get: function () {
			return externalDefaultNamed.baz;
		}
	});
	Object.defineProperty(exports, 'bar', {
		enumerable: true,
		get: function () {
			return externalNamed.bar;
		}
	});
	Object.defineProperty(exports, 'quux', {
		enumerable: true,
		get: function () {
			return externalNamedNamespace.quux;
		}
	});

	Object.defineProperty(exports, '__esModule', { value: true });

});

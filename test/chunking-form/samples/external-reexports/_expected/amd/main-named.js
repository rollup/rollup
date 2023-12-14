define(['exports', 'external-all', 'external-named', 'external-default-named', 'external-named-namespace'], (function (exports, externalAll, externalNamed, externalDefaultNamed, externalNamedNamespace) { 'use strict';



	Object.defineProperty(exports, "foo", {
		enumerable: true,
		get: function () { return externalAll.foo; }
	});
	Object.defineProperty(exports, "bar", {
		enumerable: true,
		get: function () { return externalNamed.bar; }
	});
	Object.defineProperty(exports, "baz", {
		enumerable: true,
		get: function () { return externalDefaultNamed.baz; }
	});
	Object.defineProperty(exports, "quux", {
		enumerable: true,
		get: function () { return externalNamedNamespace.quux; }
	});

}));

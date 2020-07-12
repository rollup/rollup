define(['exports', 'external-all', 'external-default-namespace', 'external-named-namespace', 'external-namespace'], function (exports, externalAll, externalDefaultNamespace, externalNamedNamespace, externalNamespace) { 'use strict';



	exports.foo = externalAll;
	exports.baz = externalDefaultNamespace;
	exports.quux = externalNamedNamespace;
	exports.bar = externalNamespace;

	Object.defineProperty(exports, '__esModule', { value: true });

});

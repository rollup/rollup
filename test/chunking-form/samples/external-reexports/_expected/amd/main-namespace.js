define(['exports', 'external-all', 'external-default-namespace', 'external-named-namespace', 'external-namespace'], function (exports, externalAll, externalDefaultNamespace, externalNamedNamespace, externalNamespace$1) { 'use strict';

	const externalNamespace = 42;
	console.log(externalNamespace);

	exports.foo = externalAll;
	exports.baz = externalDefaultNamespace;
	exports.quux = externalNamedNamespace;
	exports.bar = externalNamespace$1;

	Object.defineProperty(exports, '__esModule', { value: true });

});

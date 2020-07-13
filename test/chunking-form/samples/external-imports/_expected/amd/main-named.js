define(['external-all', 'external-default-named', 'external-named', 'external-named-namespace'], function (foo, baz, externalNamed, quux) { 'use strict';

	console.log(foo.foo, externalNamed.bar, baz.baz, quux.quux);

});

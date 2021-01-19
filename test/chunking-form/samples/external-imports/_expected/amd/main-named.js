define(['external-all', 'external-named', 'external-default-named', 'external-named-namespace'], function (foo, externalNamed, baz, quux) { 'use strict';

	console.log(foo.foo, externalNamed.bar, baz.baz, quux.quux);

});

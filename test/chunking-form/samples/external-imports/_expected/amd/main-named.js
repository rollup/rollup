define(['external-all', 'external-default-named', 'external-named', 'external-named-namespace'], function (foo, baz, externalNamed, quux$1) { 'use strict';

	console.log(foo.foo, externalNamed.bar, baz.baz, quux$1.quux);

});

define(function () { 'use strict';

	let foo = () => {};
	foo.value = foo;

	while ( foo.value ) {
		foo = foo.value;
	}

	foo();
	foo.bar = 1;
	foo['baz'] = 1;

});

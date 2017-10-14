(function () {
	'use strict';

	let foo = () => function () {};
	foo.value = foo;

	while ( foo.value ) {
		foo = foo.value;
	}

	foo();
	foo()();
	new (foo())();
	foo.bar = 1;

}());

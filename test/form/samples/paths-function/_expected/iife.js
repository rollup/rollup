(function (foo) {
	'use strict';

	assert.equal(foo, 42);

	import('https://unpkg.com/foo').then(({ default: foo }) => assert.equal(foo, 42));

})(foo);

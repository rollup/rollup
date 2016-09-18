define(['https://unpkg.com/foo'], function (foo) { 'use strict';

	foo = 'default' in foo ? foo['default'] : foo;

	assert.equal( foo, 42 );

});

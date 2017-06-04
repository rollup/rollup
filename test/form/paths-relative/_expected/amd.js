define(['../foo'], function (foo) { 'use strict';

	foo = foo && 'default' in foo ? foo['default'] : foo;

	assert.equal( foo, 42 );

});

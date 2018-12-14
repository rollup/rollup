(function (factory) {
	typeof define === 'function' && define.amd ? define(['../foo'], factory) :
	factory(global.foo);
}(function (foo) { 'use strict';

	foo = foo && foo.hasOwnProperty('default') ? foo['default'] : foo;

	assert.equal( foo, 42 );

}));

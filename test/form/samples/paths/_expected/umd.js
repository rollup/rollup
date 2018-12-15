(function (factory) {
	typeof define === 'function' && define.amd ? define(['https://unpkg.com/foo'], factory) :
	factory(global.foo);
}(function (foo) { 'use strict';

	foo = foo && foo.hasOwnProperty('default') ? foo['default'] : foo;

	assert.equal( foo, 42 );

}));

(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	async function foo () {
		return 'foo';
	}

	foo().then( value => console.log( value ) );

}));

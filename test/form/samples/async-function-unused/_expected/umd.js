(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	async function foo () {
		return 'foo';
	}

	foo().then( value => console.log( value ) );

})));

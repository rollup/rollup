(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	// bar.js
	var bar = 21;

	// foo.js

	var foo = bar * 2;

	// main.js

	console.log( foo );

}));

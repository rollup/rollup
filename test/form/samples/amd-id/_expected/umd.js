(function (factory) {
	typeof define === 'function' && define.amd ? define('my-id', factory) :
	factory();
})((function () { 'use strict';

	console.log(42);

}));

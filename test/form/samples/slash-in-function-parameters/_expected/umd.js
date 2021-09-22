(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	class someClass {}

	function someFunction (text = '/') {}

	console.log(someClass, someFunction);

}));

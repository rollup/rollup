(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	const mutateThis = () => {
		undefined.x = 1;
	};

	function Test () {
		mutateThis();
	}

	const test = new Test();

}));

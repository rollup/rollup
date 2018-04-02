(function (global, factory) {
	typeof module === 'object' && module.exports ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.myBundle = factory());
}(this, (function () { 'use strict';

	var main = (input) => {
		try {
			JSON.stringify(input);
			return true;
		} catch (e) {
			return false;
		}
	};

	return main;

})));

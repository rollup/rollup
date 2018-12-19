(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.myBundle = factory());
}(this, function () { 'use strict';

	var main = (input) => {
		try {
			JSON.stringify(input);
			return true;
		} catch (e) {
			return false;
		}
	};

	return main;

}));

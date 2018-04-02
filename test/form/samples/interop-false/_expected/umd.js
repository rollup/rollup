(function (global, factory) {
	typeof module === 'object' && module.exports ? module.exports = factory(require('core/view')) :
	typeof define === 'function' && define.amd ? define(['core/view'], factory) :
	(global.foo = factory(global.View));
}(this, (function (View) { 'use strict';

	var main = View.extend({});

	return main;

})));

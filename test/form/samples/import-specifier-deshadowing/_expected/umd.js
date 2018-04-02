(function (global, factory) {
	typeof module === 'object' && module.exports ? module.exports = factory(require('react-sticky')) :
	typeof define === 'function' && define.amd ? define(['react-sticky'], factory) :
	(global.Sticky = factory(global.reactSticky));
}(this, (function (reactSticky) { 'use strict';

	var Sticky = function () {
		function Sticky() {}

		Sticky.foo = reactSticky.Sticky;

		return Sticky;
	}();

	return Sticky;

})));

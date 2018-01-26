'use strict';

var reactSticky = require('react-sticky');

var Sticky = function () {
	function Sticky() {}

	Sticky.foo = reactSticky.Sticky;

	return Sticky;
}();

module.exports = Sticky;

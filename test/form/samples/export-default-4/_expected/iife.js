this.my = this.my || {};
this.my.global = this.my.global || {};
this.my.global.namespace = (function () {
	'use strict';

	var main = 42;

	return main;

}());

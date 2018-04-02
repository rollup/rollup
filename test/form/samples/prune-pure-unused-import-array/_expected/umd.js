(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('other')) :
	typeof define === 'function' && define.amd ? define(['other'], factory) :
	(factory(global.other));
}(this, (function (other) { 'use strict';



})));

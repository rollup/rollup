(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports, require('highcharts')) :
	typeof define === 'function' && define.amd ? define(['exports', 'highcharts'], factory) :
	(factory((global.myBundle = {}),global.highcharts));
}(this, (function (exports,highcharts) { 'use strict';

	exports.Highcharts = highcharts;

	Object.defineProperty(exports, '__esModule', { value: true });

})));

define(['require', './generated-existing', './direct-relative-external', 'to-indirect-relative-external', 'direct-absolute-external', 'to-indirect-absolute-external'], function (require, existing, directRelativeExternal, toIndirectRelativeExternal, directAbsoluteExternal, toIndirectAbsoluteExternal) { 'use strict';

	// nested
	new Promise(function (resolve, reject) { require(['./generated-existing'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['./direct-relative-external'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-relative-external'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['direct-absolute-external'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-absolute-external'], resolve, reject) });

	//main
	new Promise(function (resolve, reject) { require(['./generated-existing'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['./direct-relative-external'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-relative-external'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['direct-absolute-external'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-absolute-external'], resolve, reject) });

	new Promise(function (resolve, reject) { require(['dynamic-direct-external' + unknown], resolve, reject) });
	new Promise(function (resolve, reject) { require(['to-dynamic-indirect-external'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['./generated-existing'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['my' + 'replacement'], resolve, reject) });

});

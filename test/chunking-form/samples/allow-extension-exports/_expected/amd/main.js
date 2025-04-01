define(['require', './generated-lib1'], (function (require, libs) { 'use strict';

	console.log(libs.value1);
	console.log(libs.value1$1);
	console.log(libs.value2);
	console.log(new Promise(function (resolve, reject) { require(['./generated-lib1'], resolve, reject); }).then(function (n) { return n.lib3; }).then(m => m.value3));

}));

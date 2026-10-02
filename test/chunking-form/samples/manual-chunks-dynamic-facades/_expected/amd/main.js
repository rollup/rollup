define(['require', 'exports'], (function (require, exports) { 'use strict';

	const DEP = 'DEP';

	Promise.all([new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); }), new Promise(function (resolve, reject) { require(['./generated-dynamic2'], resolve, reject); }), new Promise(function (resolve, reject) { require(['./generated-dynamic3'], resolve, reject); })]).then(
		results => console.log(results, DEP)
	);

	exports.DEP = DEP;

}));

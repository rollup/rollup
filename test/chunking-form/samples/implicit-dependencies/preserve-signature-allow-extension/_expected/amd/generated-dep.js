define(['require', 'exports'], (function (require, exports) { 'use strict';

	const value = 42;

	console.log(value);
	new Promise(function (resolve, reject) { require(['./generated-dynamicDep'], resolve, reject); });
	const dep = 'dep';

	exports.dep = dep;
	exports.value = value;

}));

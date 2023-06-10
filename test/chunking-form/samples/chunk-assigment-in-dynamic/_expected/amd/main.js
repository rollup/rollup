define(['require'], (function (require) { 'use strict';

	const importA = () => new Promise(function (resolve, reject) { require(['./generated-a'], resolve, reject); });
	const importB = () => new Promise(function (resolve, reject) { require(['./generated-b'], resolve, reject); });

	console.log(importA, importB);

}));

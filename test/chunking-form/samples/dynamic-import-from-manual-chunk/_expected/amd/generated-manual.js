define(['require', './main'], (function (require, main) { 'use strict';

	console.log(main.dep2);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); });

}));

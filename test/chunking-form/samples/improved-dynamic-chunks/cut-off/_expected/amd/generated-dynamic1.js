define(['require', './generated-dep'], (function (require, dep) { 'use strict';

	console.log('dynamic1', dep.value);
	new Promise(function (resolve, reject) { require(['./generated-dynamic2'], resolve, reject); });

}));

define(['require', './generated-dep'], (function (require, dep) { 'use strict';

	console.log('main1', dep.value);
	new Promise(function (resolve, reject) { require(['./generated-dynamic1'], resolve, reject); });

}));

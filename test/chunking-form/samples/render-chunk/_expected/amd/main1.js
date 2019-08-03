define(['./chunk-dep2'], function (dep2) { 'use strict';

	var num = 1;

	console.log(num + dep2.num);

});
console.log('fileName', 'main1.js');
console.log('imports', 'chunk-dep2.js');
console.log('isEntry', true);
console.log('name', 'main1');
console.log('modules.length', 2);

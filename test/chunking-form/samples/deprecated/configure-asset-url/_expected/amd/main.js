define(['require'], function (require) { 'use strict';

	var asset2 = 'resolved';

	var asset3 = new URL(require.toUrl('assets/asset-unresolved-9548436d.txt'), document.baseURI).href;

	new Promise(function (resolve, reject) { require(['./nested/chunk'], resolve, reject) }).then(result => console.log(result, asset2, asset3));

});

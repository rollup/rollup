(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	const url = 'attributes={"foo":"bar"}';
	const asset = 'attributes={"foo":"bar"}';

	console.log('asset', asset);
	console.log('url', url);

}));

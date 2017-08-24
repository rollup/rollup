define(function () { 'use strict';

	var effect = () => {};
	effect = function() {
		console.log('effect');
	};

	var alsoEffect = () => {};
	alsoEffect = effect;
	alsoEffect();

});

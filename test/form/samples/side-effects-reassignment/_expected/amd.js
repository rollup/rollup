define((function () { 'use strict';

	var effect = function() {
		console.log('effect');
	};

	var alsoEffect = effect;
	alsoEffect();

}));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	async function hasEffects1 () {
		await globalPromise;
		console.log( 'effect' );
	}

	hasEffects1();

	async function hasEffects2 () {
		await globalFunction();
	}

	hasEffects2();

})));

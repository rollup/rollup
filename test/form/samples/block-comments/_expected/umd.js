(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function foo () {
		return embiggen( 6, 7 );
	}

	/**
	 * Embiggens a number
	 * @param {number} num - the number to embiggen
	 * @param {number} factor - the factor to embiggen it by
	 * @returns {number}
	 */
	function embiggen ( num, factor ) {
		return num * factor;
	}

	alert( foo() );

})));

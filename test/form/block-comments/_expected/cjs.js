'use strict';

/**
 * Embiggens a number
 * @param {number} num - the number to embiggen
 * @param {number} factor - the factor to embiggen it by
 * @returns {number}
 */
function embiggen ( num, factor ) {
	return num * factor;
}

function foo () {
	return embiggen( 6, 7 );
}

alert( foo() );

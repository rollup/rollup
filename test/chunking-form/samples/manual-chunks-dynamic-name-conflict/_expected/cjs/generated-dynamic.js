'use strict';

console.log('dynamic2');

const DYNAMIC_A = 'DYNAMIC_A';
const DYNAMIC_B = 'DYNAMIC_B';

var dynamic2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	DYNAMIC_A: DYNAMIC_A,
	DYNAMIC_B: DYNAMIC_B
}, null));

console.log('dynamic1');

var dynamic1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	DYNAMIC_A: DYNAMIC_B,
	DYNAMIC_B: DYNAMIC_A
}, null));

exports.dynamic1 = dynamic1;
exports.dynamic2 = dynamic2;

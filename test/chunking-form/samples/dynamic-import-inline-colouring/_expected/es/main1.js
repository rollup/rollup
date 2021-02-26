import './generated-separate.js';

var inlined$1 = 'inlined';
const x = 1;
console.log('inlined');

var inlined$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': inlined$1,
	x: x
});

const inlined = Promise.resolve().then(function () { return inlined$2; });
const separate = import('./generated-separate.js');

export { inlined, separate };

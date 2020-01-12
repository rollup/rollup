import './generated-separate.js';

var inlined = 'inlined';
const x = 1;

var inlined$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': inlined,
	x: x
});

const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
const separate = import('./generated-separate.js');

export { inlined$2 as inlined, separate };

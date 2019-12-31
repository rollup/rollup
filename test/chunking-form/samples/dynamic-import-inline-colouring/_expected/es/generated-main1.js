var inlined = 'inlined';
const x = 1;

var inlined$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': inlined,
	x: x
});

var separate = 'separate';
const x$1 = 2;

var separate$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': separate,
	x: x$1
});

const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
const separate$2 = Promise.resolve().then(function () { return separate$1; });

export { separate$2 as a, inlined$2 as i, separate as s, x$1 as x };

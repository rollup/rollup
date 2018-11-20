import './chunk-61f7224d.js';

var inlined = 'inlined';
const x = 1;

var inlined$1 = /*#__PURE__*/Object.freeze({
	default: inlined,
	x: x
});

const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
const separate = import("./chunk-61f7224d.js");

export { inlined$2 as inlined, separate };

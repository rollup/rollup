var dep = { foo: 1 };
const bar = 2;

var dep$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), dep, {
	'default': dep,
	bar: bar
}), '__esModule', { value: true }));

export { dep$1 as d };

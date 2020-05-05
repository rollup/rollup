var value = 42;

const promise = import('./generated-dynamic.js').then(result => console.log('main', result, value));

var main = /*#__PURE__*/Object.freeze({
	__proto__: null,
	promise: promise
});

export { main as m, promise, value as v };

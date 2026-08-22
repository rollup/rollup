var value = 42;

const promise = import('./generated-dynamic.js').then(result => console.log('main', result, value));

var main = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	promise: promise
}, null));

export { main as m, value as v };

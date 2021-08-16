import { function as function$1 } from 'external';
export { function as bar, foo as default } from 'external';

var other = {
	foo: 'bar'
};

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), other, {
	default: other
}));

console.log(ns, other.foo, other.function, other["some-prop"], function$1);
console.log(import.meta['function'], import.meta['some-prop']);

let f = 1;
f++;

export { f as function };

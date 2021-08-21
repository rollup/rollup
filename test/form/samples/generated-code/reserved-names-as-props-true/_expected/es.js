import { function as function$1 } from 'external';
import * as external from 'external';
export { external as default };
export { function as bar, default as void } from 'external';
import * as defaultOnly from 'externalDefaultOnly';
import someDefault from 'external2';

var other = {
	foo: 'bar'
};

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), other, {
	default: other
}));

console.log(ns, other.foo, other.function, other["some-prop"], function$1, someDefault, defaultOnly);
console.log(import.meta['function'], import.meta['some-prop']);

let f = 1;
f++;

export { f as function };

import * as defaultLegacy from 'external';
import defaultLegacy__default, { b } from 'external';
export * from 'external';
export { foo } from 'external';
import externalAuto from 'externalAuto';
import * as externalDefault from 'externalDefault';
import * as externalDefaultOnly from 'externalDefaultOnly';

let a;

({ a } = b);
console.log({ a } = b);

Promise.resolve().then(function () { return main; }).then(console.log);

import('external').then(console.log);
console.log(defaultLegacy__default);
console.log(externalAuto);
console.log(externalDefault);
console.log(externalDefaultOnly);

var main = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), defaultLegacy, {
	get a () { return a; },
	foo: foo
}));

export { a };

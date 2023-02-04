import { s as shared } from './main.js';

const sharedDynamic = true;

import('./generated-dynamic2.js');
console.log(sharedDynamic);

var dynamic1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	shared: shared
});

export { dynamic1 as d, sharedDynamic as s };

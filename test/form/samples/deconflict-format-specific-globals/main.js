import external from 'external';
console.log(external);

const _interopDefault = 0;
const module = 1;
const require = 2;
const exports = 3;
const document = 4;
const URL = 5;
console.log(_interopDefault, module, require, exports, document, URL);

import('external');
let value = 0;
export { value as default };
console.log(import.meta.url);

function nested1() {
	const _interopDefault = 0;
	const module = 1;
	const require = 2;
	const exports = 3;
	const document = 4;
	const URL = 5;
	console.log(_interopDefault, module, require, exports, document, URL);

	import('external');
	value = 1;
	console.log(import.meta.url);
}

nested1();

function nested2() {
	const _interopDefault = 0;
	const module = 1;
	const require = 2;
	const exports = 3;
	const document = 4;
	const URL = 5;
	console.log(_interopDefault, module, require, exports, document, URL);
}

nested2();

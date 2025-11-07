import external from 'external';

console.log(external);

const _interopDefault$1 = 1;
const _interopNamespace$1 = 1;
const module$1 = 1;
const require$1 = 1;
const exports$1 = 1;
const document$1 = 1;
const URL$1 = 1;
console.log(_interopDefault$1, _interopNamespace$1, module$1, require$1, exports$1, document$1, URL$1);

import('external').then(console.log);
let value = 0;
console.log(import.meta.url);

function nested1() {
	const _interopDefault = 1;
	const _interopNamespace = 1;
	const module = 1;
	const require = 1;
	const exports$1 = 1;
	const document = 1;
	const URL = 1;
	console.log(_interopDefault, _interopNamespace, module, require, exports$1, document, URL);

	import('external').then(console.log);
	value = 1;
	console.log(import.meta.url);
}

nested1();

function nested2() {
	const _interopDefault = 1;
	const _interopNamespace = 1;
	const module = 1;
	const require = 1;
	const exports$1 = 1;
	const document = 1;
	const URL = 1;
	console.log(_interopDefault, _interopNamespace, module, require, exports$1, document, URL);
}

nested2();

export { value as default };

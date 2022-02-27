import * as nsDefault from 'external-default';
import * as nsDefaultOnly from 'external-defaultOnly';
import * as nsMerged from './dep.js';

function verifyNamespace(ns, expected) {
	assert.deepStrictEqual(Object.getOwnPropertyDescriptor(ns, Symbol.toStringTag), {
		value: 'Module',
		configurable: false,
		enumerable: false,
		writable: false
	});

	const assigned = Object.assign({}, ns);
	const spreaded = { ...ns };

	assert.deepStrictEqual(assigned, expected);
	assert.strictEqual(assigned[Symbol.toStringTag], undefined);

	assert.deepStrictEqual(spreaded, expected);
	assert.strictEqual(spreaded[Symbol.toStringTag], undefined);
}

verifyNamespace(nsDefault, { answer: 42, default: { answer: 42 } });
verifyNamespace(nsDefaultOnly, { default: { answer: 42 } });
verifyNamespace(nsMerged, { answer: 42, extra: 'extra' });

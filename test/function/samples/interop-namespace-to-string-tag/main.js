import * as nsDefault from 'external-default';
import * as nsDefaultOnly from 'external-defaultOnly';

function verifyNamespace(ns) {
	assert.deepStrictEqual(Object.getOwnPropertyDescriptor(ns, Symbol.toStringTag), {
		value: 'Module',
		configurable: false,
		enumerable: false,
		writable: false
	});

	const assigned = Object.assign({}, ns);
	const spreaded = { ...ns };

	assert.deepStrictEqual(assigned, { default: 42 });
	assert.strictEqual(assigned[Symbol.toStringTag], undefined);

	assert.deepStrictEqual(spreaded, { default: 42 });
	assert.strictEqual(spreaded[Symbol.toStringTag], undefined);
}

verifyNamespace(nsDefault);
verifyNamespace(nsDefaultOnly);

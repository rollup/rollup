import * as ns from './reexport';

const checkNamespace = ns => {
	assert.strictEqual(ns.internal, 'original', 'internal');
	ns.updateInternal();
	assert.strictEqual(ns.internal, 'updated', 'internal');
	assert.strictEqual(ns.external, 'original', 'external');
	ns.updateExternal();
	assert.strictEqual(ns.external, 'updated', 'external');
};

checkNamespace(ns);

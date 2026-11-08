const object = { property: 1 };

delete object?.property;
assert.strictEqual(object.property, undefined);

if (object.property) {
	throw new Error('delete was tree-shaken away');
}

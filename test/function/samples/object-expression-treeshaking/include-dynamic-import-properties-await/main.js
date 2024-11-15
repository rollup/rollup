export async function assertImport() {
	const { foo } = await import('./dep.js');
	assert.strictEqual(foo.bar.baz, 42);
}

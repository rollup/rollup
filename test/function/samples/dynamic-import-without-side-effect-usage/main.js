export async function test() {
	const foo = await import('./dep.js');
	assert.equal(foo.value, 42)
}

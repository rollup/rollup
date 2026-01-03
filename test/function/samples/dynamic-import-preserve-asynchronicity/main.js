let effect = false;

async function importFirst() {
	await import('./dep.js');
	effect = true;
}

export async function test() {
	const promise = importFirst();
	assert.equal(effect, false);
	await promise;
	assert.equal(effect, true);
}

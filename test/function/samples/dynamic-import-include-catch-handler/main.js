let finallyCalled = false

export const test = import('./dep.js')
  .finally(() => {
    finallyCalled = true;
  })
	.catch(() => {
		const obj = {
			value: false,
			check() {
				return obj.value ? true : false;
			}
		};
		return obj;
	})
	.then(result => {
    result.value = true;
		assert.ok(result.check());
    assert.ok(finallyCalled);
	});

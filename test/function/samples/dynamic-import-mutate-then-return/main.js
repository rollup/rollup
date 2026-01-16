export const test = import('./dep.js')
	.then(() => {
		const obj = {
			value: false,
			check() {
				assert.ok(obj.value ? true : false);
			}
		};
		return obj;
	})
	.then((obj) => {
    obj.value = true;
    obj.check();
  });

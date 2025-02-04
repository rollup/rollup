const value = 42;

export function test(callback) {
	return callback ? execute(undefined, callback) : new Promise(execute);

	function execute(resolve) {
		if (resolve) resolve(value);
		else resolve('FAIL');
	}
}

export const result = test().then(r => r);

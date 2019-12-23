let ok = false;

function test() {
	a: {
		for (let i = 0; i < 2; i++) {
			if (i === 1) {
				break a;
			}
		}
		return;
	}
	ok = true;
}

test();

assert.ok(ok);

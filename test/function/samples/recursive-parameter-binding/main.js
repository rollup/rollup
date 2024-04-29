let created = 0;

function Test(options) {
	if (!this) {
		return new Test(options);
	}
	if (options.x) {
		return 0;
	}
	created++;
}

function Test2(options) {
	if (!this) {
		return new Test2(options);
	}
	if (options.x) {
		return 0;
	}
	created++;
}

new Test({});
Test2`{}`;

assert.equal(created, 2);

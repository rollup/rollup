const safeCall = call => {
	call()
	try {
		return call();
	} catch {}
};

const identity = x => x;

const opts = { foo: 1 };
assert.deepStrictEqual(
	safeCall(() => identity(opts)),
	{ foo: 1 }
);

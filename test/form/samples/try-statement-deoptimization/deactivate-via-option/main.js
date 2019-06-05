function callGlobal() {
	Object.create(null);
}

function test(callback) {
	try {
		Object.create(null);
		callback();
		callGlobal();
	} catch {}
}

test(() => {
	Object.create(null);
});

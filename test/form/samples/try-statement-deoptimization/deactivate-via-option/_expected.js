function test(callback) {
	try {
		callback();
	} catch {}
}

test(() => {
});

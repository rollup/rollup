function callGlobalRemoved() {
	Object.create(null);
}

function callGlobalRetained() {
	Object.create(null);
	callGlobalRemoved();
}

function tryIt({ callback }) {
	try {
		callback();
	} catch {}
}

tryIt({ callback: callGlobalRetained });

tryIt({
	callback: () => {
		Object.create(null);
	}
});

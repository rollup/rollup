function callGlobalRetained() {
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

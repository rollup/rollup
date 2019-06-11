function properlyTreeshaken() {
	Object.create(null);
}

function tryIt({ callback }) {
	try {
		callback();
	} catch {}
}

tryIt({ callback: properlyTreeshaken });

tryIt({
	callback: () => {
		Object.create(null);
	}
});

function callGlobalRemoved1() {
}

function callGlobalRemoved2() {
}

function callGlobalRetained() {
	Object.create(null);
	callGlobalRemoved1();
}

function tryIt(other, callback) {
	try {
		callback();
	} catch {}
}

tryIt(callGlobalRemoved2, callGlobalRetained);

tryIt(
	() => {
	},
	() => {
		Object.create(null);
	}
);

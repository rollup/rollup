function callGlobalTreeshaken() {
	Object.create(null);
}

function callGlobalRemoved1() {
	Object.create(null);
	callGlobalTreeshaken();
}

function callGlobalRemoved2() {
	Object.create(null);
	callGlobalTreeshaken();
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
		Object.create(null);
	},
	() => {
		Object.create(null);
	}
);

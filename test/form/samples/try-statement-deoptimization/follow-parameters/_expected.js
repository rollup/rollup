function callGlobal1() {
}

function callGlobal2() {
	Object.create(null);
}

function tryIt(other, callback) {
	try {
		callback();
	} catch {}
}

tryIt(callGlobal1, callGlobal2);

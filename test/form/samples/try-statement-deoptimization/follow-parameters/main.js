function properlyTreeshaken() {
	Object.create(null);
}

function tryIt(other, callback) {
	try {
		callback();
	} catch {}
}

tryIt(properlyTreeshaken, properlyTreeshaken);

tryIt(
	() => {
		Object.create(null);
	},
	() => {
		Object.create(null);
	}
);

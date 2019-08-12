function properlyTreeshaken() {
}

function tryIt(other, callback) {
	try {
		callback();
	} catch {}
}

tryIt(properlyTreeshaken, properlyTreeshaken);

tryIt(
	() => {
	},
	() => {
		Object.create(null);
	}
);

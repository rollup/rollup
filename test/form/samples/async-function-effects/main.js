(async function () {
	return {
		then() {
			console.log(1);
		}
	};
})();

// removed
(async function () {
	return { then() {} };
})();

(async function () {
	return {
		get then() {
			console.log(2);
			return () => {};
		}
	};
})();

(async function () {
	return {
		get then() {
			return () => console.log(3);
		}
	};
})();

// removed
(async function () {
	return {
		get then() {
			return () => {};
		}
	};
})();

(async () => ({
	then() {
		console.log(4);
	}
}))();

// removed
(async () => ({
	then() {}
}))();

(async () => ({
	get then() {
		console.log(5);
		return () => {};
	}
}))();

(async () => ({
	get then() {
		return () => console.log(6);
	}
}))();

// removed
(async () => ({
	get then() {
		return () => {};
	}
}))();

(async function () {
	await {
		then: function () {
			console.log(7);
		}
	};
	return { then() {} };
})();

(async function () {
	await {
		get then() {
			console.log(8);
			return () => {};
		}
	};
	return { then() {} };
})();

(async function () {
	await {
		get then() {
			return () => console.log(9);
		}
	};
	return { then() {} };
})();

(async function () {
	await await {
		then(resolve) {
			resolve({
				then() {
					console.log(10);
				}
			});
		}
	};
	return { then() {} };
})();

async function asyncIdentity(x) {
	return x;
}

asyncIdentity({}); // no side effects - may be dropped

const promise = asyncIdentity(11);

promise.then(x => console.log(x));

asyncIdentity({
	then(success, fail) {
		success(console.log(12));
	}
});

asyncIdentity({
	then(resolve) {
		resolve({
			then() {
				console.log(13);
			}
		});
	}
});

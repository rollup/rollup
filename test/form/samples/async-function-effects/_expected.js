(async function () {
	return {
		then() {
			console.log(1);
		}
	};
})();

(async function () {
	await {
		then: function () {
			console.log(2);
		}
	};
	return { then() {} };
})();

(async function () {
	await {
		get then() {
			console.log(3);
			return () => {};
		}
	};
	return { then() {} };
})();

(async function () {
	await {
		get then() {
			return () => console.log(4);
		}
	};
	return { then() {} };
})();

(async function () {
	await await {
		then(resolve) {
			resolve({
				then() {
					console.log(5);
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

const promise = asyncIdentity(6);

promise.then(x => console.log(x));

asyncIdentity({
	then(success, fail) {
		success(console.log(7));
	}
});

asyncIdentity({
	then(resolve) {
		resolve({
			then() {
				console.log(8);
			}
		});
	}
});

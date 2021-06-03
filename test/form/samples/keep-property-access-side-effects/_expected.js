const getter = {
	get foo() {
		console.log('effect');
	}
};
getter.foo;

const empty = {};
empty.foo.tooDeep;

function accessArg(arg) {
	arg.tooDeep;
}
accessArg(null);

globalThis.unknown.unknownProperty;

({
	...{
		get prop() {
			console.log('effect');
		}
	}
});

((async function () {
	return {
		get then() {
			console.log('effect');
			return () => {};
		}
	};
}))();

(async () => ({
	get then() {
		console.log('effect');
		return () => {};
	}
}))();

((async function () {
	await {
		get then() {
			console.log('effect');
			return () => {};
		}
	};
	return { then() {} };
}))();

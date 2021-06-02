const getter = {
	get foo() {
		console.log('effect');
	}
};
const foo1 = getter.foo;

const empty = {};
const foo2 = empty.foo.tooDeep;

function accessArg(arg) {
	const foo3 = arg.tooDeep;
}
accessArg(null);

const foo4 = globalThis.unknown.unknownProperty;

const foo5 = {
	...{
		get prop() {
			console.log('effect');
		}
	}
};

const foo6 = (async function () {
	return {
		get then() {
			console.log('effect');
			return () => {};
		}
	};
})();

const foo7 = (async () => ({
	get then() {
		console.log('effect');
		return () => {};
	}
}))();

const foo8 = (async function () {
	await {
		get then() {
			console.log('effect');
			return () => {};
		}
	};
	return { then() {} };
})();

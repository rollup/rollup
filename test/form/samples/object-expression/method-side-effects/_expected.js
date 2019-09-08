const y = {
	a() {},
	[globalThis.unknown]() {
		console.log('effect');
	}
};

y.a();

const z = {
	[globalThis.unknown]() {}
};

z.a();

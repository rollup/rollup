const y = {
	a() {},
	b: () => {},
	[globalThis.unknown]() {
		console.log('effect');
	}
};

y.a();
y.b();

const z = {
	[globalThis.unknown]() {}
};

z.a();
z.hasOwnProperty('a');

const x = {
	[globalThis.unknown]() {
		console.log('effect');
	},
	a() {}
};

x.a();

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
z.hasOwnProperty('a'); // removed

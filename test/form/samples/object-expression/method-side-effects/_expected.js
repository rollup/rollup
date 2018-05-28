const y = {
	a() {},
	[unknown]() {
		console.log('effect');
	}
};

y.a();

const z = {
	[unknown]() {}
};

z.a();

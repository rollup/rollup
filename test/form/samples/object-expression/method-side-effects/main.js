const x = {
	[unknown]() {
		console.log('effect');
	},
	a() {}
};

x.a();

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
z.hasOwnProperty('a'); // removed

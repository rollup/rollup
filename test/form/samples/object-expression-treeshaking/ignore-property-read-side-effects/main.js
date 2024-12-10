const { a, b } = {
	a: true,
	get b() {
		console.log('effect');
	}
};

console.log(a.b);

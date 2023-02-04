Object.defineProperty(Object.prototype, 'foo', {
	get bar() {
		console.log('effect');
	}
});
const obj2 = {};
obj2.foo?.bar;
obj2.foo?.();

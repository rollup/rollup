const obj = { __proto__: null };

if (obj.foo.bar) {
	console.log('retained');
}

const obj = { __proto__: null };

obj.flag = true;

if (obj.flag) {
	console.log('mutated');
}

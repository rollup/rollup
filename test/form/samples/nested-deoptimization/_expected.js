const obj = {
	foo: { prop: true },
	bar: { otherProp: true },
	prop: true
};
obj[globalThis.unknown].prop = false;

if (obj.foo.prop) console.log('retained');
else console.log('also retained');
console.log('retained');
console.log('retained');

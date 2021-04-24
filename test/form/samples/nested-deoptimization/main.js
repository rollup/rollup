const obj = {
	foo: { prop: true },
	bar: { otherProp: true },
	prop: true
};
obj[globalThis.unknown].prop = false;

if (obj.foo.prop) console.log('retained');
else console.log('also retained');
if (obj.bar.otherProp) console.log('retained');
else console.log('removed');
if (obj.prop) console.log('retained');
else console.log('removed');

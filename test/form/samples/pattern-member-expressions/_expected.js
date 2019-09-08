const array = [false];
const obj1 = {value: false};
const obj2 = {value: false};

([array[0]] = [true]);
({a: obj1.value} = {a: true});
({[globalThis.unknown1]: obj2[globalThis.unknown2]} = {[globalThis.unknown3]: true});

if (array[0]) {
	console.log('retained');
}

if (obj1.value) {
	console.log('retained');
}

if (obj2.value) {
	console.log('retained');
}

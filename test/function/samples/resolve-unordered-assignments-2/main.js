const foo1 = { value: false };
let foo2 = { value: false };
const bar = {};

assignFoo();
foo2.value = true;

if (foo1.value) {
	bar.baz = 'present';
}

function assignFoo () {
	foo2 = foo1;
}

export default bar;

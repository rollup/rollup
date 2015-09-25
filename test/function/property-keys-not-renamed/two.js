const obj = {
	foo: foo
};

function foo () {
	return 'two';
}

export default function () {
	return obj.foo();
}

const obj = {
	foo: foo
};

function foo () {
	return 'one';
}

export default function () {
	return obj.foo();
}

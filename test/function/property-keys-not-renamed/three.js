var obj = {
	foo: foo
};

function foo () {
	return 'three';
}

export default function () {
	return obj.foo();
}

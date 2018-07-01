const obj1 = { x: false },
	obj2 = { x: false };

function foo() {
	if (Math.random() > 0.5) {
		return () => obj1;
	}
	return () => obj2;
}

foo()().x = true;

if (!(obj1.x || obj2.x)) {
	throw new Error('Reassignment not tracked');
}

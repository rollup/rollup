const obj1 = { x: false },
	obj2 = { x: false };

function foo() {
	if (Math.random() > 0.5) {
		return function() {
			return obj1;
		};
	}
	return function() {
		return obj2;
	};
}

foo()().x = true;

if (!(obj1.x || obj2.x)) {
	throw new Error('function reassignment not tracked');
}

const obj3 = { x: false },
	obj4 = { x: false };

const bar = () => {
	if (Math.random() > 0.5) {
		return () => obj3;
	}
	return () => obj4;
};

bar()().x = true;

if (!(obj3.x || obj4.x)) {
	throw new Error('arrow function reassignment not tracked');
}

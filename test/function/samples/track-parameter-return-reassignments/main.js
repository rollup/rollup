function foo(getObj) {
	getObj().x = true;
}

const obj1 = {x: false};
foo(() => obj1);

if (!obj1.x) {
	throw new Error('function parameter reassignment not tracked');
}

function Bar(getObj) {
	getObj().x = true;
}

const obj2 = {x: false};
new Bar(() => obj2);

if (!obj2.x) {
	throw new Error('constructor parameter reassignment not tracked');
}

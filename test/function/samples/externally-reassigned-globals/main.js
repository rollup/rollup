const obj1 = {
	reassigned() {}
};

global.obj1 = obj1;

global.obj2 = {
	reassigned() {}
};

export function test() {
	obj1.reassigned();
	global.obj2.reassigned();
}

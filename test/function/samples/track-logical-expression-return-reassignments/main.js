const obj1 = { x: false },
	obj2 = { x: false };

((() => obj1) || (() => obj2))().x = true;

if (!obj1.x || obj2.x) {
	throw new Error('Reassignment not tracked');
}

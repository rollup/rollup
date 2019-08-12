let foo = false;

reassign();

const obj = {
	x: false,
	[foo ? 'x' : 'y']: true
};

if (!obj.x || obj.y) {
	throw new Error('Reassignment was not tracked');
}

function reassign() {
	foo = true;
}

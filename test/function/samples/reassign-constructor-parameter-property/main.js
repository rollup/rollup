const obj = {
	flag: false
};

function Reassign(x) {
	x.flag = true;
}

new Reassign(obj);

let hasBeenReassigned = false;

if (obj.flag) {
	hasBeenReassigned = true;
}

assert.ok(hasBeenReassigned);

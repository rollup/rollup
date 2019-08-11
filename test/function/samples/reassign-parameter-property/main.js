const obj = {
	flag: false
};

function reassign(x) {
	x.flag = true;
}

reassign(obj);

let hasBeenReassigned = false;

if (obj.flag) {
	hasBeenReassigned = true;
}

assert.ok(hasBeenReassigned);

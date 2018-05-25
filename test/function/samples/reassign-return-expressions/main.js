const obj = {
	flag: false
};

function getObj() {
	if (Math.random() < 0.5) return obj;
	return obj;
}

getObj().flag = true;

let hasBeenReassigned = false;

if (obj.flag) {
	hasBeenReassigned = true;
}

assert.ok(hasBeenReassigned);

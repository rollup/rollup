const obj = {
	flag: false
};

const getObj = () => obj;

getObj().flag = true;

let hasBeenReassigned = false;

if (obj.flag) {
	hasBeenReassigned = true;
}

assert.ok(hasBeenReassigned);

let flag = true;

// invariant object literals can still be dropped
let run = {
	test1: flag,
	test2: true,
	test3: flag,
	test4: true,
};

run.test1 && (function() {
	const obj = {
		modify() {
			this.modified = true;
		}
	};
	obj.modify();
	console.log(obj.modified ? "PASS1" : "FAIL1");
})();

run.test2 && (function() {
	const obj = {};
	function modify() {
		this.modified = true;
	}
	modify.call(obj);
	console.log(obj.modified ? "PASS2" : "FAIL2");
})();

run.test3 && (function() {
	const obj = {};
	obj.modify = modify;
	function modify() {
		this.modified = true;
	}
	obj.modify();
	console.log(obj.modified ? "PASS3" : "FAIL3");
})();

if (run.test4) {
	const axis = {};
	axis[getResult().axis] = 1;
	if (axis.x) {
		console.log('PASS4');
	} else {
		console.log('FAIL4');
	}
	function getResult() {
		const result = {};
		result.axis = 'x';
		return result;
	}
}

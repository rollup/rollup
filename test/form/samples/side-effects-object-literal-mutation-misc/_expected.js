((function() {
	const obj = {
		modify() {
			this.modified = true;
		}
	};
	obj.modify();
	console.log(obj.modified ? "PASS1" : "FAIL1");
})());

 ((function() {
	const obj = {};
	function modify() {
		this.modified = true;
	}
	modify.call(obj);
	console.log(obj.modified ? "PASS2" : "FAIL2");
})());

 ((function() {
	const obj = {};
	obj.modify = modify;
	function modify() {
		this.modified = true;
	}
	obj.modify();
	console.log(obj.modified ? "PASS3" : "FAIL3");
})());

{
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

var results = [], log = x => results.push(x);

(function () {
	var a = "PASS1";
	for (var b = 2; --b >= 0; ) {
		(function() {
			var c = function() {
				return 1;
			}(c && (a = "FAIL1"));
		})();
	}
	log(a);
})();

log(a ? "FAIL2" : "PASS2");
var a = 1;

var b = 2;
log(b ? "PASS3" : "FAIL3");

log(c ? "FAIL4" : "PASS4");
var c = 3;
log(c ? "PASS5" : "FAIL5");

log(function() {
	if (x) return "FAIL6";
	var x = 1;
	return "PASS6";
}());

(function () {
	var first = state();
	var on = true;
	var obj = {
		state: state
	};
	log(first)
	log(obj.state());
	function state() {
		return on ? "ON" : "OFF";
	}
})();

(function () {
	var flag = false;

	function foo() {
		if (flag) {
			if (!value) log(flag + "1");
		}
		var value = true;
		log(flag + "2");
	}

	foo();

	flag = true;
	foo();
})();

assert.strictEqual(results.join(" "), "PASS1 PASS2 PASS3 PASS4 PASS5 PASS6 OFF ON false2 true1 true2");

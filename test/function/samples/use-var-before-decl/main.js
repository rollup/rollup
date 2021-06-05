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

/* TODO: multi-scope var-use-before-defined bug to be addressed in a future PR
(function () {
	var first = state();
	var on = true;
	var obj = {
		state: state
	};
	log(first, obj.state());
	function state() {
		return on ? "ON" : "OFF";
	}
})();
*/

assert.strictEqual(results.join(" "), "PASS1 PASS2 PASS3 PASS4 PASS5");

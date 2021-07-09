console.log(function() {
	if (x) return "HELLO"; // TDZ
	const x = 1;           // keep
	return "WORLD";        // not reached
}());

const C = 1 + C + 2; // TDZ
let L = L;           // TDZ
console.log("X+" ); // optimize

console.log(Y ? "Y+" : "Y-"); // TDZ
const Y = 2;                  // keep

console.log(Z ? "Z+" : "Z-"); // TDZ
const Z = 3;                  // keep
console.log("Z+" ); // keep

console.log(obj.x.y ? 1 : 2); // TDZ
const obj = {                 // keep
	x: {
		y: true
	}
};
console.log(3 ); // keep

L2;              // TDZ for L2
L3 = 20;    // TDZ for L3
let L2, L3;  // keep L2, L3
L3 = 30;             // keep

cls;                 // TDZ
class cls {}

// Note that typical var/const/let use is still optimized
(function() {
	console.log(A ? "A" : "!A");
	var A = 1;
	console.log("A" );
	console.log("B");
	console.log("B" );
	console.log("C" );
	console.log("D" );
})();

(function let_tdz() {
	let flag = false;
	function foo() {
		if (flag) {
			value; // TDZ
		}
		let value;
	}
	foo();
	flag = true;
	foo();
})();

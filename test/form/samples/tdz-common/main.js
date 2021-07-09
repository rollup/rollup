console.log(function() {
	if (x) return "HELLO"; // TDZ
	const x = 1;           // keep
	return "WORLD";        // not reached
}());

const unused1 = 1;   // drop
let unused2 = 2;     // drop
unused3;             // drop
var unused3 = 3;     // drop
class unused4 {}     // drop

const C = 1 + C + 2; // TDZ
let L = L;           // TDZ

const X = 1;                  // drop
console.log(X ? "X+" : "X-"); // optimize

console.log(Y ? "Y+" : "Y-"); // TDZ
const Y = 2;                  // keep

console.log(Z ? "Z+" : "Z-"); // TDZ
const Z = 3;                  // keep
console.log(Z ? "Z+" : "Z-"); // keep

console.log(obj.x.y ? 1 : 2); // TDZ
const obj = {                 // keep
	x: {
		y: true
	}
};
console.log(obj.x.y ? 3 : 4); // keep

V2, L2;              // TDZ for L2
var V2;              // drop
V3 = 10, L3 = 20;    // TDZ for L3
let L1, L2, L3, L4;  // keep L2, L3
var V3;              // drop
L3 = 30;             // keep
L4 = 40;             // drop

cls;                 // TDZ
class cls {}

// Note that typical var/const/let use is still optimized
(function() {
	console.log(A ? "A" : "!A");
	var A = 1, B = 2;
	const C = 3;
	let D = 4;
	console.log(A ? "A" : "!A");
	if (B) console.log("B");
	else console.log("!B");
	console.log(B ? "B" : "!B");
	console.log(C ? "C" : "!C");
	console.log(D ? "D" : "!D");
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

// should be dropped
(function() {
	function foo() {
		const access = () => value;
		let value;
		access();
	};
	foo();
})();

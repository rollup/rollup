console.log(function() {
	if (x) return "HELLO"; // TDZ
	const x = 1;           // keep
	return "WORLD";        // not reached
}());

const unused1 = 1;   // drop
let unused2 = 2;     // drop
var unused3 = 3;     // drop

const C = 1 + C + 2; // TDZ
let L = L;           // TDZ
var V = V;           // TODO: uncommon scenario, but should be dropped

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

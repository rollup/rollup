const a = a; // keep

const b = getB(); // keep
function getB() {
	return b;
}

function getC() {
	return c;
}
const c = getC(); // keep

class d extends d {} // keep

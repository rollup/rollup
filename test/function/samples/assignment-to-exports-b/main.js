var a = { prop: 42 };
var b = a.prop;

function set ( new_a, new_b ) {
	a = new_a;
	b = new_b;
}

export { a, b, set };

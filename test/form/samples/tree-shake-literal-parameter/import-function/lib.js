// export default
export default function (a, b, enable) {
	if (enable) {
		return a + b;
	}
	return a - b;
}

export function add1(a, b, enable) {
	if (enable) {
		return a + b;
	}
	return a - b;
}

export function add2(a, b, enable) {
	if (enable) {
		return a + b;
	}
	return a - b;
}

// keep it
export function add3(a, b, enable) {
	if (enable) {
		return a + b;
	}
	return a - b;
}

// conditional expression
export function add4(a, b, enable) {
	if (enable? true: false) {
		return a + b;
	}
	return a - b;
}

// export default
export default (a, b, enable) => {
	if (enable) {
		return a + b;
	}
	return a - b;
}

export const arrowAdd1 = (a, b, enable) => {
	if (enable) {
		return a + b;
	}
	return a - b;
}

// keep it
export const arrowAdd2 = (a, b, enable) => {
	if (enable) {
		return a + b;
	}
	return a - b;
}

// conditional expression
export const arrowAdd3 = (a, b, enable) => {
	if (enable? true: false) {
		return a + b;
	}
	return a - b;
}

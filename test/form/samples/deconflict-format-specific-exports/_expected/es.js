const exports = {
	x: 42
};
console.log(exports);

function nestedConflict() {
	const exports = {
		x: 42
	};
	console.log(exports);
	x++;
}

function nestedNoConflict() {
	const exports = {
		x: 42
	};
	console.log(exports);
}

var x = 43;
nestedConflict();
nestedNoConflict();

export { x };

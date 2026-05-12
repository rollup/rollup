const exports$1 = {
	x: 42
};
console.log(exports$1);

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

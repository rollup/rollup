const exports$1 = {
	x: 42
};
console.log(exports$1);

function nestedConflict() {
	const exports$1 = {
		x: 42
	};
	console.log(exports$1);
	x++;
}

function nestedNoConflict() {
	const exports$1 = {
		x: 42
	};
	console.log(exports$1);
}

var x = 43;
nestedConflict();
nestedNoConflict();

export { x };

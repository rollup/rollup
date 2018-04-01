function getStringA() {
	return 'A';
}

console.log(true && getStringA());

function getStringB() {
	return 'B';
}

console.log(false && getStringB());

function getStringC() {
	return 'C';
}

console.log(true || getStringC());

function getStringD() {
	return 'D';
}

console.log(false || getStringD());

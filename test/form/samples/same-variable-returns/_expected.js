console.log('x' );

// Returning different variables stays conservative
const first = { a: 1 };
const second = { a: 2 };

function getDifferent(condition) {
	if (condition) return first;
	return second;
}

console.log(getDifferent(globalThis.condition).a ? 'x' : 'y');

// Returning a variable declared later stays conservative
function getTdz(condition) {
	if (condition) return later;
	let later = { a: 1 };
	return later;
}

console.log(getTdz(globalThis.condition).a ? 'x' : 'y');

// Returning a hoisted variable stays conservative
function getHoisted(condition) {
	if (condition) return hoisted;
	var hoisted = { a: 1 };
	return hoisted;
}

console.log(getHoisted(globalThis.condition).a ? 'x' : 'y');

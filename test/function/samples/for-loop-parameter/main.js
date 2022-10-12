export function checkObject(p) {
	return getFromObjectInLoop(p);
}

export function checkArray(p) {
	return getFromArrayInLoop(p);
}

function getFromObjectInLoop(path) {
	for (let { foo } = path;;) {
		return foo;
	}
}

function getFromArrayInLoop(path) {
	for (let [ foo ] = path;;) {
		return foo;
	}
}
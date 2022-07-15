class Removed {}

export function getInstance() {
	throw new Error('error');
	return new Removed();
}

console.log(getInstance());

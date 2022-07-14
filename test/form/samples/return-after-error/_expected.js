function getInstance() {
	throw new Error('error');
}

console.log(getInstance());

export { getInstance };

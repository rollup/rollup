function Note() {
	this.foo = 'foo';
}

export function create(data) {
	return new Note(data || {});
}

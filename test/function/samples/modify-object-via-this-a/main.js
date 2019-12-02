const obj = {
	modify() {
		this.modified = true;
	}
};

obj.modify();

assert.strictEqual(obj.modified ? 'MODIFIED' : 'BROKEN', 'MODIFIED');

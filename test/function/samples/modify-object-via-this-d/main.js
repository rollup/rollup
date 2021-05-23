const obj = {
	modify() {}
};

obj.modify = modify;

function modify() {
	this.modified = true;
}

obj.modify();

assert.strictEqual(obj.modified ? 'MODIFIED' : 'BROKEN', 'MODIFIED');

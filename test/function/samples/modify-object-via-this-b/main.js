const obj = {};

function modify() {
	this.modified = true;
}

modify.call(obj);

assert.strictEqual(obj.modified ? 'MODIFIED' : 'BROKEN', 'MODIFIED');

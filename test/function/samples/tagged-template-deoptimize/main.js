const tagReturn = 'return';

const param = { modified: false };

const obj = {
	modified: false,
	tag(_, param) {
		this.modified = true;
		param.modified = true;
		return tagReturn;
	}
};

assert.strictEqual(obj.tag`${param}`, 'return');
assert.ok(obj.modified ? true : false, 'obj');
assert.ok(param.modified ? true : false, 'param');

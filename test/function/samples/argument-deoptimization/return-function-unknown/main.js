const obj = { mutated: false };

global.handler = () => target => {
	target.mutated = true;
	delete global.handler;
};

handler()(obj);

assert.ok(obj.mutated ? true : false);

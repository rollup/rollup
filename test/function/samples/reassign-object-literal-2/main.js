let triggered = false;

const obj = {
	reassigned() {}
};

global.wrapper = { obj };

global.wrapper.obj.reassigned = function() {
	triggered = true;
};

obj.reassigned();

assert.ok(triggered);

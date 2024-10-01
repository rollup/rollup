let effect = false;

var b = {
	get a() {
		effect = true;
	}
};

function X() {}
X.prototype = b;
new X().a;

assert.ok(effect);

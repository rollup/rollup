let triggered = false;

const obj = {
	reassigned() {}
};

let y = obj;
reassign();
y = null;

function reassign() {
	y.reassigned = function() {
		triggered = true;
	};
}

obj.reassigned();

assert.ok(triggered);

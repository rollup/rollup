var x = true;
var triggered = false;

reassign();

(x ? () => () => {} : () => () => {triggered = true;})()();

function reassign() {
	x = false;
}

assert.ok(triggered);

let modified = false;

function sideEffect() {
	modified = true;
	return null;
}

sideEffect()?.x;
assert.ok(modified);

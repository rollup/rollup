function getIcon() {
	var icon = undefined;
	icon = { code: true };
	return icon;
}

function main() {
	var a = getIcon() || {
		code: undefined
	};
	if (!a.code) {
		return 'broken';
	}
	return 'works';
}

assert.strictEqual(main(), 'works');

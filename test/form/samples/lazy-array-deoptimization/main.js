var foo = {toggled: false};

if (false) {
	var baz = [foo];
	baz[0].toggled = true;
}

if (foo.toggled) console.log('this should be removed');
else console.log('retained');

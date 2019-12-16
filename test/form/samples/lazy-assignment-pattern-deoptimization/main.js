var foo = { toggled: false };
var modified = false;

if (false) {
	var { bar: bar = foo } = {};
	bar.toggled = true;
	({ modified = false } = { modified: true });
}

if (foo.toggled) console.log('this should be removed');
else console.log('retained');

if (modified) console.log('this should be removed');
else console.log('retained');

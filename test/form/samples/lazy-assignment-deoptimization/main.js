const foo = { toggled: false };
const bar = { toggled: false };

if (foo.toggled) {
	foo.toggled = bar;
}

if (foo.toggled) console.log('this should be removed');
else console.log('retained');

if (bar.toggled) console.log('this should be removed');
else console.log('retained');

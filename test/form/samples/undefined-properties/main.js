var a = {
	b: {
		c: 'd'
	}
};

if (a.b.d) console.log('removed');
else console.log('retained');

if (a.c.d) console.log('retained for effect');
else console.log('retained for effect');
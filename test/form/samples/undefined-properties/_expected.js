var a = {
	b: {
		c: 'd'
	}
};

console.log('retained');

if (a.c.d) console.log('retained for effect');
else console.log('retained for effect');

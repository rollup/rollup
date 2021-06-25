const obj1 = { flag: false };
{
	var foo = obj1;
	foo.flag = true;
}
if (obj1.flag) console.log('retained');

const obj2 = { flag: false };
try {
	throw new Error();
} catch {
	var foo = obj2;
	foo.flag = true;
}
if (obj2.flag) console.log('retained');

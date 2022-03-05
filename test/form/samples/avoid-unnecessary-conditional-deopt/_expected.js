console.log('not modified');

let x2 = false;
modifyX2();
const obj2 = { modified: false };
(x2 ? obj2 : {}).modified = true;

if (obj2.modified) console.log('modified');
else console.log('not modified');

function modifyX2() {
	x2 = true;
}

console.log('not modified');

let x4 = false;
modifyX4();
const obj4 = { modified: false };
(x4 && obj4).modified = true;

if (obj4.modified) console.log('modified');
else console.log('not modified');

function modifyX4() {
	x4 = true;
}

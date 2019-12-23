let x1 = false;
modifyX1();
const obj1 = {};
x1 ? obj1 : {};

if (obj1.modified) console.log('should not happen');
else console.log('not modified');

function modifyX1() {
	x1 = true;
}

let x2 = false;
modifyX2();
const obj2 = {};
(x2 ? obj2 : {}).modified = true;

if (obj2.modified) console.log('modified');
else console.log('not modified');

function modifyX2() {
	x2 = true;
}

let x3 = false;
modifyX3();
const obj3 = {};
x3 && obj3;

if (obj3.modified) console.log('should not happen');
else console.log('not modified');

function modifyX3() {
	x3 = true;
}

let x4 = false;
modifyX4();
const obj4 = {};
(x4 && obj4).modified = true;

if (obj4.modified) console.log('modified');
else console.log('not modified');

function modifyX4() {
	x4 = true;
}

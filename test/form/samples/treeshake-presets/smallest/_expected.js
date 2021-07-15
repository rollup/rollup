console.log('main');

let flag = true;

function test() {
	if (flag) var x = true;
	if (x) {
		return;
	}
	console.log('effect');
}

test();
flag = false;
test();

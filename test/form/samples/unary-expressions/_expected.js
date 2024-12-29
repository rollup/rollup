if ((false).unknown) {
	console.log('retained');
} else {
	console.log('retained');
}

console.log('retained 1');
console.log('retained 2');
console.log('retained 3');
if (delete 1) console.log('retained 4');
console.log('retained 5');
console.log('retained 6');
console.log('retained 7');

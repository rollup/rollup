let x = false;
let iteratedForIn = false;

for (x in {key: true}) {
	if (x === 'key') {
		iteratedForIn = true;
	}
}

assert.ok(iteratedForIn);

let y = false;
let iteratedForOf = false;

for (y of ['key']) {
	if (y === 'key') {
		iteratedForOf = true;
	}
}

assert.ok(iteratedForOf);

const foo = [{ value: 1 }];

for (const item of foo) {
	item.value = 0;
}

assert.ok(foo[0].value === 0 ? true : false);

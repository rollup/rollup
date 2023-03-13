const list = [ { value: 1 } ];

for (const item of list) {
    item.value = 0;
}

if (list[0].value === 0) {
    console.log(42);
}

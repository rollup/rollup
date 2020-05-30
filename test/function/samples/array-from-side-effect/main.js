export let x = 1;
const list = [1, 2, 3];
Array.from(list, v => (x += v));

const list = [1, 2];
export let result = 0;

list.forEach(p => list.forEach(pp => (result += p * pp)));

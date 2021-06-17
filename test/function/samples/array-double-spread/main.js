const a = [false, , true];
const b = [false, , true, ...a, false, , true, ...a];

let count = 0;

b[0] ? count+= 10: count++;
b[1] ? count+= 10: count++;
b[2] ? count+= 10: count++;
b[3] ? count+= 10: count++;
b[4] ? count+= 10: count++;
b[5] ? count+= 10: count++;
b[6] ? count+= 10: count++;
b[7] ? count+= 10: count++;
b[8] ? count+= 10: count++;
b[9] ? count+= 10: count++;
b[10] ? count+= 10: count++;
b[11] ? count+= 10: count++;

assert.strictEqual(count, 48);

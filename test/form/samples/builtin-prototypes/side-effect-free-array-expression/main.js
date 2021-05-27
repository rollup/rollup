const foo1 = [1, 2, 3];
foo1.at(0);
console.log(foo1[0]);

const foo2 = [1, 2, 3];
foo2.concat([0]);
console.log(foo2[0]);

const foo3 = [1, 2, 3];
foo3.entries();
console.log(foo3[0]);

const foo4 = [1, 2, 3];
foo4.every(v => v);
console.log(foo4[0]);

const foo5 = [1, 2, 3];
foo5.filter(v => v % 1 === 0);
console.log(foo5[0]);

const foo6 = [1, 2, 3];
foo6.find(v => v);
console.log(foo6[0]);

const foo7 = [1, 2, 3];
foo7.findIndex(v => v);
console.log(foo7[0]);

const foo8 = [1, 2, 3];
foo8.forEach(() => {});
console.log(foo8[0]);

const foo9 = [1, 2, 3];
foo9.map(v => v);
console.log(foo9[0]);

const foo10 = [1, 2, 3];
foo10.reduce((a, v) => a + v, 0);
console.log(foo10[0]);

const foo11 = [1, 2, 3];
foo11.reduceRight((a, v) => a + v, 0);
console.log(foo11[0]);

const foo12 = [1, 2, 3];
foo12.slice(1);
console.log(foo12[0]);

const foo13 = [1, 2, 3];
foo13.some(v => v);
console.log(foo13[0]);

const foo14 = [1, 2, 3];
foo14.values();
console.log(foo14[0]);

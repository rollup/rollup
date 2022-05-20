const a = (p = 'retained') => console.log(p);
a();

const b = (p) => console.log(p);
b('value');

const c = (p = console.log('retained because of side effect')) => {};
c();

const d = (p) => console.log('effect');
d();

const e = (p) => {};
e();

const f = ({ x = console.log('retained') }) => {};
f('value');

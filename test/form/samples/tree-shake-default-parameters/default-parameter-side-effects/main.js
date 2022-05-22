const a = (p = 'retained') => console.log(p);
a();

const b = (p = console.log('removed')) => console.log(p);
b('value');

const c = (p = console.log('retained because of side effect')) => {};
c();

const d = (p = 'removed because no side effect') => console.log('effect');
d();

const e = (p = console.log('removed')) => console.log('effect');
e('value');

const f = ({ x = console.log('retained') } = {}) => {};
f('value');

const removed = (p = console.log('ignored')) => {};
removed('value');

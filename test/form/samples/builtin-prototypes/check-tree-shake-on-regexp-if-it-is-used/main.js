const commonRegexp_1 = /1/;
const commonRegexp_2 = /1/;

commonRegexp_1.test('1');
commonRegexp_2.exec('1');

assert.strictEqual(commonRegexp_1.test('1'), true);
assert.ok(commonRegexp_2.exec('1'));

const globalRegexp_1 = /1/g;
const globalRegexp_2 = /1/g;

globalRegexp_1.test('1');
globalRegexp_2.exec('1');

assert.strictEqual(globalRegexp_1.test('1'), null);
assert.strictEqual(globalRegexp_2.exec('1'), null);

const stickyRegexp_1 = /1/y;
const stickyRegexp_2 = /1/y;

stickyRegexp_1.test('1');
stickyRegexp_2.exec('1');

assert.strictEqual(stickyRegexp_1.test('1'), null);
assert.strictEqual(stickyRegexp_2.exec('1'), null);

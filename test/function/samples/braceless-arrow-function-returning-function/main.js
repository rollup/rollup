const f = (a) => (b) => { return a * b }
function ff (a) { return f(a) }
assert.equal( ff(2)(3), 6 );

const g = (a) => { return (b) => { return a - b } }
function gg (a) { return g(a) }
assert.equal( gg(2)(3), -1 );

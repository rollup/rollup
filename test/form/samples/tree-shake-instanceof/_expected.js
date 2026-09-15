class C { }

class E { }
class F extends E { }

class ClassUnknownHasInstance { static [Symbol.hasInstance]() { return Math.random() > 0.5 } }
class ClassStaticHasInstanceMisused { static [Symbol.hasInstance]() { return true } }
class ClassStaticHasInstanceSideEffectful { static [Symbol.hasInstance]() { return (globalThis.effect = true), false } }

const instClassUnknownHasInstance = new ClassUnknownHasInstance();
const instClassStaticHasInstanceMisused = new ClassStaticHasInstanceMisused();
const instClassStaticHasInstanceSideEffectful = new ClassStaticHasInstanceSideEffectful();

class ClassInstanceUnknownHasInstance { [Symbol.hasInstance]() { return Math.random() > 0.5 } }
class ClassInstanceStaticHasInstance { [Symbol.hasInstance]() { return true } }
class ClassInstanceStaticHasInstanceSideEffectful { [Symbol.hasInstance]() { return (globalThis.effect = true), false } }

const instClassInstanceUnknownHasInstance = new ClassInstanceUnknownHasInstance();
const instClassInstanceStaticHasInstance = new ClassInstanceStaticHasInstance();
const instClassInstanceStaticHasInstanceSideEffectful = new ClassInstanceStaticHasInstanceSideEffectful();

const objUnknownHasInstance = { [Symbol.hasInstance]: () => Math.random() > 0.5 };
const objStaticHasInstanceSideEffectful = { [Symbol.hasInstance]: () => ((globalThis.effect = true), false) };

const value = globalThis.unknownValue;

globalThis.c = new C();
globalThis.f = new F();

console.log('kept');

console.log('kept');

if (value instanceof C) console.log('kept');
else console.log('kept');

console.log('kept');

if (value instanceof E) console.log('kept');
else console.log('kept');

if (value instanceof F) console.log('kept');
else console.log('kept');


// hasInstance resolvable, unknown ret value
if (value instanceof ClassUnknownHasInstance) console.log('kept');
else console.log('kept');

// hasInstance resolvable, true ret val
console.log('kept');

// hasInstance resolvable, true ret val
console.log('kept');

// hasInstance resolvable, false ret val, side effectful
if (value instanceof ClassStaticHasInstanceSideEffectful) ;
else console.log('kept');


// all side-effectful (throws)
if (value instanceof instClassUnknownHasInstance) console.log('kept');
else console.log('kept');

if (value instanceof instClassStaticHasInstanceMisused) console.log('kept');
else console.log('kept');

if (value instanceof instClassStaticHasInstanceSideEffectful) console.log('kept');
else console.log('kept');


// instantiated
if (value instanceof ClassInstanceUnknownHasInstance) console.log('kept');
else console.log('kept');

// instantiation could be removed if Rollup could analyse calls to instances
if (value instanceof ClassInstanceStaticHasInstance) console.log('could be removed');
else console.log('kept');

// instantiated
if (value instanceof ClassInstanceStaticHasInstanceSideEffectful) console.log('kept');
else console.log('kept');


// hasInstance resolvable, unknown ret value
if (value instanceof instClassInstanceUnknownHasInstance) console.log('kept');
else console.log('kept');

// hasInstance resolvable, true ret val -- Rollup doesn't track calls to instances yet
if (value instanceof instClassInstanceStaticHasInstance) console.log('kept');
else console.log('removed');

// hasInstance resolvable, false ret val, side effectful -- Rollup doesn't track calls to instances yet
if (value instanceof instClassInstanceStaticHasInstanceSideEffectful) console.log('could be removed');
else console.log('kept');


// hasInstance resolvable, unknown ret value
if (value instanceof objUnknownHasInstance) console.log('kept');
else console.log('kept');

// hasInstance resolvable, true ret val
console.log('kept');

// hasInstance resolvable, false ret val, side effectful
if (value instanceof objStaticHasInstanceSideEffectful) ;
else console.log('kept');

// Weird situations and edge cases
class X { }
globalThis.x = { __proto__: X.prototype };
if (globalThis.unknownValue instanceof X) console.log('kept');
else console.log('kept');

class Y { }
globalThis.doSomethingWith(Y);
if (globalThis.unknownValue instanceof Y) console.log('kept');
else console.log('kept');

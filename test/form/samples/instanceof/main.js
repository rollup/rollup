class Unused1 {}

if ({} instanceof Unused1) console.log('removed');
else console.log('retained');

function Unused2() {}

if ({} instanceof Unused2) console.log('removed');
else console.log('retained');

class Used1 {}
const Intermediate = Used1;
const used1 = new Used1();

if (used1 instanceof Intermediate) console.log('retained');
else console.log('does not matter');

class Used2 {}

if (new Used2() instanceof Intermediate) console.log('retained');
else console.log('does not matter');

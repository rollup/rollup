x + y;
const { x } = {};
const [y] = [];

if (z) console.log('unimportant');
else console.log('retained');

var { z } = { z: true };

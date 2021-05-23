const spread = [true, false];
const array = [true, false, ...spread];

console.log('retained');
console.log('retained');
if (array[2]) console.log('retained');
else console.log('unimportant');
if (array[3]) console.log('unimportant');
else console.log('retained');

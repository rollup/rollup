const spread = [true, false];
const array = [true, false, ...spread];

if (array[0]) console.log('retained');
else console.log('removed');
if (array[1]) console.log('removed');
else console.log('retained');
if (array[2]) console.log('retained');
else console.log('unimportant');
if (array[3]) console.log('unimportant');
else console.log('retained');

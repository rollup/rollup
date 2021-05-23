const array = [true, true];

array[1] = false;
array[2] = true;

if (array[0]) console.log('retained');
else console.log('removed');
if (array[1]) console.log('unimportant');
else console.log('retained');
if (array[2]) console.log('retained');
else console.log('unimportant');

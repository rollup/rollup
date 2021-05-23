const array = [true, false, 3];

if (array[0]) console.log('retained');
else console.log('removed');
if (array[1]) console.log('removed');
else console.log('retained');
if (array[2] === 3) console.log('retained');
else console.log('removed');
if (array[3]) console.log('removed');
else console.log('retained');

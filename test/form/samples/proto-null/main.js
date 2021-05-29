const a = { __proto__: null };
if (a.hasOwnProperty) console.log('removed');
else console.log('retained');
if (a.foo) console.log('removed');
else console.log('retained');

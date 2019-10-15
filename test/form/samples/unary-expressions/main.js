if ((!true).unknown) {
	console.log('retained');
} else {
	console.log('retained');
}

if (!false) console.log('retained 1');
if (+'1' === 1) console.log('retained 2');
if (-1 + 2 === 1) console.log('retained 3');
if (delete 1) console.log('retained 4');
if (typeof 1 === 'number') console.log('retained 5');
if (void 1 === undefined) console.log('retained 6');
if (~1 === -2) console.log('retained 7');

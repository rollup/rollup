'foo'.replace('o', 'removed');
'foo'.replace('o', () => 'removed');
'foo'.replace('o', () => {
	console.log('retained');
	return '_';
});

'foo'.replaceAll('o', 'removed');
'foo'.replaceAll('o', () => 'removed');
'foo'.replaceAll('o', () => {
	console.log('retained');
	return '_';
});

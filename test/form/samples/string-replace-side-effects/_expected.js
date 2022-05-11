'foo'.replace('o', () => {
	console.log('retained');
	return '_';
});
'foo'.replaceAll('o', () => {
	console.log('retained');
	return '_';
});
